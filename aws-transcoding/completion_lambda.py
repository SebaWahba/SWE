
import json
import os
import boto3
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def lambda_handler(event, context):
    print(f"Received event: {json.dumps(event)}")

    try:
        job_id = event["detail"]["jobId"]
        status = event["detail"]["status"]
        user_metadata = event["detail"]["userMetadata"]
        video_id = user_metadata.get("videoId")

        if not video_id:
            print(f"Video ID not found in user metadata for job {job_id}. Skipping update.")
            return {
                'statusCode': 400,
                'body': json.dumps('Video ID missing from job metadata.')
            }

        if status == "COMPLETE":
            # Assuming the HLS master playlist will be at the root of the output path
            # The output path is defined in the ingest lambda as s3://S3_OUTPUT_BUCKET/video_id/
            # So the master playlist will be s3://S3_OUTPUT_BUCKET/video_id/index.m3u8 (or similar)
            # We need to construct the public URL for this.
            s3_output_bucket_name = os.environ.get("S3_OUTPUT_BUCKET")
            hls_master_playlist_key = f"{video_id}/index.m3u8" # Common HLS master playlist name
            public_hls_url = f"https://{s3_output_bucket_name}.s3.amazonaws.com/{hls_master_playlist_key}" # This assumes public read access or will need CloudFront URL

            response = supabase.from_("videos").update({
                "status": "ready",
                "video_file": public_hls_url # Update with the HLS master playlist URL
            }).eq("id", video_id).execute()

            if response.data:
                print(f"Video {video_id} status updated to 'ready' and video_file set to {public_hls_url}.")
            else:
                print(f"Failed to update video {video_id} status to 'ready' in Supabase.")
                # Log more details if needed

        elif status == "ERROR" or status == "CANCELED":
            response = supabase.from_("videos").update({"status": "failed"}).eq("id", video_id).execute()
            if response.data:
                print(f"Video {video_id} status updated to 'failed' in Supabase due to MediaConvert job {status}.")
            else:
                print(f"Failed to update video {video_id} status to 'failed' in Supabase.")
                # Log more details if needed
        else:
            print(f"MediaConvert job {job_id} has status {status}. No action taken.")

    except Exception as e:
        print(f"Error processing MediaConvert completion event: {e}")
        # Consider logging the event for further investigation

    return {
        'statusCode': 200,
        'body': json.dumps('MediaConvert completion process completed.')
    }
