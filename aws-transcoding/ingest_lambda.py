
import json
import os
import boto3
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize MediaConvert client
MEDIACONVERT_ENDPOINT = os.environ.get("MEDIACONVERT_ENDPOINT")
MEDIACONVERT_ROLE = os.environ.get("MEDIACONVERT_ROLE")
S3_OUTPUT_BUCKET = os.environ.get("S3_OUTPUT_BUCKET")

mediaconvert_client = boto3.client(
    'mediaconvert',
    region_name=os.environ.get("AWS_REGION"),
    endpoint_url=MEDIACONVERT_ENDPOINT
)

def lambda_handler(event, context):
    print(f"Received event: {json.dumps(event)}")

    for record in event['Records']:
        bucket_name = record['s3']['bucket']['name']
        object_key = record['s3']['object']['key']
        video_id = os.path.splitext(object_key)[0] # Assuming video_id is the filename without extension

        source_s3_url = f"s3://{bucket_name}/{object_key}"
        output_s3_path = f"s3://{S3_OUTPUT_BUCKET}/{video_id}/"

        try:
            # Update video status to 'processing' in Supabase
            response = supabase.from_('videos').update({'status': 'processing'}).eq('id', video_id).execute()
            if response.data:
                print(f"Updated video {video_id} status to 'processing' in Supabase.")
            else:
                print(f"Could not find video {video_id} in Supabase to update status.")
                # Optionally, raise an error or handle this case if the video record must exist

            # MediaConvert Job Settings
            job_settings = {
                "Inputs": [
                    {
                        "AudioSelectors": {
                            "Audio Selector 1": {
                                "DefaultSelection": "DEFAULT"
                            }
                        },
                        "VideoSelector": {
                            "ColorSpace": "FOLLOW"
                        },
                        "FileInput": source_s3_url
                    }
                ],
                "OutputGroups": [
                    {
                        "Name": "HLS_Group",
                        "OutputGroupSettings": {
                            "Type": "HLS_GROUP_SETTINGS",
                            "HlsGroupSettings": {
                                "SegmentLength": 6,
                                "Destination": output_s3_path,
                                "MinSegmentLength": 0,
                                "CodecSpecification": "RFC_4281",
                                "DirectoryStructure": "SINGLE_DIRECTORY",
                                "ManifestDurationFormat": "FLOATING_POINT",
                                "StreamInfResolution": "FOLLOW",
                                "TimedMetadataPassthrough": "PASSTHROUGH",
                                "CaptionSegmentLengthControl": "NO_CONTROL",
                                "ProgramDateTimePeriod": 600,
                                "ManifestCompression": "NONE",
                                "ClientCache": "ENABLED",
                                "AudioOnlyHeader": "EXCLUDE",
                                "OutputSelection": "DELIVERS_PRIMARY_CONTENT",
                                "ProgramDateTime": "EXCLUDE",
                                "SegmentationMode": "USE_INPUT_SEGMENTATION",
                                "SegmentsPerSubdirectory": 10000
                            }
                        },
                        "Outputs": [
                            # 1080p Output
                            {
                                "Preset": "System-Generic_Hd_Mp4_Avc_Aac_16x9_1920x1080p_24Hz_8Mbps_Cbr", # Example preset, adjust as needed
                                "VideoDescription": {
                                    "Width": 1920,
                                    "Height": 1080,
                                    "CodecSettings": {
                                        "Codec": "H_264",
                                        "H264Settings": {
                                            "MaxBitrate": 8000000,
                                            "RateControlMode": "CBR",
                                            "SceneChangeDetect": "TRANSITION_DETECTION"
                                        }
                                    }
                                },
                                "AudioDescriptions": [
                                    {
                                        "CodecSettings": {
                                            "Codec": "AAC",
                                            "AacSettings": {
                                                "Bitrate": 160000,
                                                "CodingMode": "CODING_MODE_2_0",
                                                "SampleRate": 48000
                                            }
                                        }
                                    }
                                ]
                            },
                            # 720p Output
                            {
                                "Preset": "System-Generic_Hd_Mp4_Avc_Aac_16x9_1280x720p_24Hz_4Mbps_Cbr", # Example preset, adjust as needed
                                "VideoDescription": {
                                    "Width": 1280,
                                    "Height": 720,
                                    "CodecSettings": {
                                        "Codec": "H_264",
                                        "H264Settings": {
                                            "MaxBitrate": 4000000,
                                            "RateControlMode": "CBR",
                                            "SceneChangeDetect": "TRANSITION_DETECTION"
                                        }
                                    }
                                },
                                "AudioDescriptions": [
                                    {
                                        "CodecSettings": {
                                            "Codec": "AAC",
                                            "AacSettings": {
                                                "Bitrate": 128000,
                                                "CodingMode": "CODING_MODE_2_0",
                                                "SampleRate": 48000
                                            }
                                        }
                                    }
                                ]
                            },
                            # 360p Output
                            {
                                "Preset": "System-Generic_Sd_Mp4_Avc_Aac_16x9_640x360p_24Hz_1Mbps_Cbr", # Example preset, adjust as needed
                                "VideoDescription": {
                                    "Width": 640,
                                    "Height": 360,
                                    "CodecSettings": {
                                        "Codec": "H_264",
                                        "H264Settings": {
                                            "MaxBitrate": 1000000,
                                            "RateControlMode": "CBR",
                                            "SceneChangeDetect": "TRANSITION_DETECTION"
                                        }
                                    }
                                },
                                "AudioDescriptions": [
                                    {
                                        "CodecSettings": {
                                            "Codec": "AAC",
                                            "AacSettings": {
                                                "Bitrate": 96000,
                                                "CodingMode": "CODING_MODE_2_0",
                                                "SampleRate": 48000
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }

            # Create MediaConvert job
            job_response = mediaconvert_client.create_job(
                Role=MEDIACONVERT_ROLE,
                Settings=job_settings,
                UserMetadata={
                    'videoId': video_id
                }
            )
            print(f"MediaConvert job created: {job_response['Job']['Id']}")

        except Exception as e:
            print(f"Error processing S3 object {object_key}: {e}")
            # Optionally, update Supabase status to 'failed' or similar
            supabase.from_('videos').update({'status': 'failed'}).eq('id', video_id).execute()

    return {
        'statusCode': 200,
        'body': json.dumps('MediaConvert job submission process completed.')
    }
