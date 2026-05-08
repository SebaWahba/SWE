# Video Transcoding Pipeline Architecture

This document outlines the implementation of the automated video transcoding pipeline using AWS services and Supabase.

## Workflow Overview

1.  **Upload**: Admin uploads a raw video file to the **S3 Ingest Bucket**.
2.  **Trigger**: S3 triggers an **Ingest Lambda Function** on `s3:ObjectCreated:*` events.
3.  **Job Submission**: The Ingest Lambda creates an **AWS Elemental MediaConvert** job.
    *   **Input**: The uploaded raw video file.
    *   **Output**: HLS segments at 360p, 720p, and 1080p.
    *   **Destination**: **S3 Output Bucket**.
4.  **Status Tracking**: The system updates the Supabase `videos` table status to `processing`.
5.  **Completion Hook**: AWS EventBridge monitors MediaConvert job status changes.
6.  **Completion Handler**: EventBridge triggers a **Completion Lambda Function** when the job finishes.
    *   **Success**: Updates Supabase record status to `ready` and sets the `video_file` URL to the HLS master playlist.
    *   **Failure**: Logs the error and ensures the status is not set to `ready`.
7.  **Visibility**: The frontend filters out any videos where status is not `ready`.

## Components to Implement

### 1. AWS Lambda Functions
*   `ingest-trigger`: Submits the MediaConvert job.
*   `completion-handler`: Updates Supabase based on job results.

### 2. MediaConvert Job Configuration
*   HLS Output Group with three renditions:
    *   1080p (High bitrate)
    *   720p (Medium bitrate)
    *   360p (Low bitrate)

### 3. Database Updates
*   Modify `videos` table status handling.
*   Ensure `video_file` points to the `.m3u8` master playlist upon completion.

### 4. Frontend Integration
*   Update `Browse.tsx` to filter by `status === 'ready'`.
*   Update `Watch.tsx` to prevent playback of non-ready videos.
*   Update `Admin.tsx` to set initial status to `processing`.

## Security & Reliability
*   **IAM Roles**: Least privilege access for Lambda to S3 and MediaConvert.
*   **Error Handling**: Failures are logged; status remains `processing` or moves to `error`.
*   **No Public Access**: S3 buckets are private; content served via CloudFront (recommended) or signed URLs.
