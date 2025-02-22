import os
from fastapi import FastAPI, File, UploadFile
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from dotenv import load_dotenv
from io import BytesIO
from fastapi.middleware.cors import CORSMiddleware
# Load environment variables
load_dotenv()
VISION_ENDPOINT = os.getenv("AZURE_VISION_ENDPOINT")
VISION_KEY = os.getenv("AZURE_VISION_KEY")

# Initialize Azure AI Vision Client
vision_client = ImageAnalysisClient(VISION_ENDPOINT, AzureKeyCredential(VISION_KEY))

# FastAPI App
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific domains for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Waste classification mapping
WASTE_CATEGORIES = {
    "plastic": {"type": "Plastic Waste", "disposal": "Recycle in a plastic bin"},
    "bottle": {"type": "Plastic Bottle Waste", "disposal": "Recycle in a plastic bin"},
    "container": {"type": "Plastic Container Waste", "disposal": "Recycle in a plastic bin"},
    "paper": {"type": "Paper Waste", "disposal": "Recycle in a paper bin"},
    "glass": {"type": "Glass Waste", "disposal": "Recycle in a glass bin"},
    "metal": {"type": "Metal Waste", "disposal": "Recycle at a metal collection center"},
    "organic": {"type": "Organic Waste", "disposal": "Compost or dispose in an organic bin"},
    "electronic": {"type": "E-Waste", "disposal": "Take to an e-waste recycling center"},
    "general": {"type": "General Waste", "disposal": "Dispose in a landfill bin"}
}

@app.post("/classify")
async def classify_waste(file: UploadFile = File(...)):
    try:
        # Read the image bytes
        image_bytes = await file.read()

        # Analyze image using Azure AI Vision
        analysis_result = vision_client._analyze_from_image_data(
            image_data=BytesIO(image_bytes),
            visual_features=["objects", "caption", "denseCaptions"]
        )

        # Extract detected objects & captions
        detected_objects = [obj.lower() for obj in analysis_result.objects] if analysis_result.objects else []
        detected_caption = analysis_result.caption.text.lower() if analysis_result.caption else ""

        print(f"\n🔍 AI Vision Response:\nObjects: {detected_objects}\nCaption: {detected_caption}\n")

        # Match detected objects to waste categories
        for category, data in WASTE_CATEGORIES.items():
            if category in detected_objects or category in detected_caption:
                return {
                    "waste_type": data["type"],
                    "disposal": data["disposal"],
                    "detected_objects": detected_objects,
                    "caption": detected_caption
                }

        # Default case if no match found
        return {
            "waste_type": WASTE_CATEGORIES["general"]["type"],
            "disposal": WASTE_CATEGORIES["general"]["disposal"],
            "detected_objects": detected_objects,
            "caption": detected_caption
        }

    except Exception as e:
        return {"error": str(e)}

