# Automated Video Transcoding Pipeline

This document details the setup and configuration for an automated video transcoding pipeline using AWS MediaConvert, S3, Lambda, and Supabase.

## Architecture Overview

The pipeline automates the conversion of uploaded video files into multiple streaming formats (HLS 360p, 720p, 1080p) and updates the video's status in Supabase.

1.  **S3 Ingest Bucket**: Raw video files are uploaded here.
2.  **S3 Event Notification**: Triggers an AWS Lambda function (`ingest-trigger`) when a new video is uploaded.
3.  **Ingest Lambda (`ingest-trigger`)**: 
    *   Receives S3 event.
    *   Updates the corresponding video record in Supabase to `status: 'processing'`.
    *   Initiates an AWS Elemental MediaConvert job with predefined settings for HLS output at 360p, 720p, and 1080p.
    *   The MediaConvert job outputs transcoded files to the **S3 Output Bucket**.
4.  **AWS EventBridge**: Monitors the status of MediaConvert jobs.
5.  **Completion Lambda (`completion-handler`)**: 
    *   Triggered by EventBridge upon MediaConvert job completion (success or failure).
    *   If successful, updates the video record in Supabase to `status: 'ready'` and sets the `video_file` field to the URL of the HLS master playlist.
    *   If failed, updates the video record in Supabase to `status: 'failed'`.
6.  **Supabase Database**: Stores video metadata, including `status` and `video_file` (HLS master playlist URL).
7.  **Frontend (Browse/Watch pages)**: Filters and displays videos based on their `status`.

## AWS IAM Policies

### 1. IAM Role for Ingest Lambda (`ingest-trigger-role`)

This role grants the `ingest-trigger` Lambda function permissions to read from the S3 Ingest Bucket, write to Supabase, and create MediaConvert jobs.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:GetObjectTagging"
            ],
            "Resource": "arn:aws:s3:::YOUR_INGEST_BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "mediaconvert:CreateJob",
                "mediaconvert:DescribeEndpoints"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/MediaConvert_Service_Role",
            "Condition": {
                "StringEquals": {
                    "iam:PassedToService": "mediaconvert.amazonaws.com"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:YOUR_AWS_REGION:YOUR_AWS_ACCOUNT_ID:log-group:/aws/lambda/ingest-trigger:*"
        }
    ]
}
```

### 2. IAM Role for Completion Lambda (`completion-handler-role`)

This role grants the `completion-handler` Lambda function permissions to update Supabase and write logs.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:YOUR_AWS_REGION:YOUR_AWS_ACCOUNT_ID:log-group:/aws/lambda/completion-handler:*"
        }
    ]
}
```

### 3. IAM Role for MediaConvert Service (`MediaConvert_Service_Role`)

This role is assumed by MediaConvert to access input files and write output files.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_INGEST_BUCKET_NAME/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::YOUR_OUTPUT_BUCKET_NAME/*"
        }
    ]
}
```

## AWS Infrastructure Configuration

### 1. S3 Buckets

*   **Ingest Bucket**: `YOUR_INGEST_BUCKET_NAME`
    *   Configure an S3 Event Notification to trigger the `ingest-trigger` Lambda function for `s3:ObjectCreated:*` events.
*   **Output Bucket**: `YOUR_OUTPUT_BUCKET_NAME`
    *   This bucket will store the transcoded HLS segments.

### 2. AWS Elemental MediaConvert

*   **Endpoint**: Obtain your MediaConvert endpoint from the AWS console (e.g., `https://xxxxxx.mediaconvert.us-east-1.amazonaws.com`). This will be used by the `ingest-trigger` Lambda.
*   **Service Role**: Ensure `MediaConvert_Service_Role` (defined above) is configured in MediaConvert settings.

### 3. AWS Lambda Functions

*   **`ingest-trigger` Lambda**:
    *   Runtime: Python 3.9 (or newer)
    *   Handler: `ingest_lambda.lambda_handler`
    *   Environment Variables:
        *   `SUPABASE_URL`: Your Supabase project URL
        *   `SUPABASE_KEY`: Your Supabase service role key (or anon key if appropriate permissions are set)
        *   `MEDIACONVERT_ENDPOINT`: Your AWS MediaConvert endpoint
        *   `MEDIACONVERT_ROLE`: ARN of the `MediaConvert_Service_Role`
        *   `S3_OUTPUT_BUCKET`: Name of your S3 Output Bucket
        *   `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
    *   Trigger: S3 Event Notification from `YOUR_INGEST_BUCKET_NAME` for `ObjectCreated` events.
*   **`completion-handler` Lambda**:
    *   Runtime: Python 3.9 (or newer)
    *   Handler: `completion_lambda.lambda_handler`
    *   Environment Variables:
        *   `SUPABASE_URL`: Your Supabase project URL
        *   `SUPABASE_KEY`: Your Supabase service role key (or anon key if appropriate permissions are set)
        *   `S3_OUTPUT_BUCKET`: Name of your S3 Output Bucket
    *   Trigger: EventBridge rule for MediaConvert Job State Change events (e.g., `detail.status` in `["COMPLETE", "ERROR", "CANCELED"]`).

### 4. Supabase Database Schema Update

Ensure your `videos` table has the `raw_video_file` column and the `video_file` column is updated to store the HLS master playlist URL.

```sql
ALTER TABLE public.videos
ADD COLUMN raw_video_file TEXT;

-- If video_file already exists, ensure it can be NULL initially
ALTER TABLE public.videos
ALTER COLUMN video_file DROP NOT NULL;
```

## Environment Variables

For local development and deployment, ensure the following environment variables are set:

*   `SUPABASE_URL`: Your Supabase project URL (e.g., `https://your-project-id.supabase.co`)
*   `SUPABASE_KEY`: Your Supabase service role key (for backend operations) or public anon key (for frontend)
*   `AWS_REGION`: The AWS region where your resources are deployed (e.g., `us-east-1`)
*   `MEDIACONVERT_ENDPOINT`: The endpoint for your AWS MediaConvert service
*   `MEDIACONVERT_ROLE`: The ARN of the IAM role MediaConvert will assume (e.g., `arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/MediaConvert_Service_Role`)
*   `S3_INGEST_BUCKET_NAME`: The name of your S3 bucket for raw video uploads
*   `S3_OUTPUT_BUCKET_NAME`: The name of your S3 bucket for transcoded video outputs

## Usage

1.  **Deploy AWS Resources**: Deploy the S3 buckets, Lambda functions, IAM roles, and EventBridge rules as described above.
2.  **Update Supabase**: Apply the schema migration to add `raw_video_file` and modify `video_file`.
3.  **Deploy Frontend**: Deploy the updated frontend application.
4.  **Upload Video**: Upload a video file via the Admin dashboard. The video will initially show as `processing`.
5.  **Monitor**: Once transcoding is complete, the video status will change to `ready`, and it will become available for streaming on the Browse and Watch pages.

