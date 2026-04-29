import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloudinary_url=settings.CLOUDINARY_URL
)

def upload_image(file: any, folder: str = "voluntra/portfolios"):
    """
    Uploads a file to Cloudinary and returns the URL and public ID.
    """
    result = cloudinary.uploader.upload(file, folder=folder)
    return result.get("secure_url"), result.get("public_id")

def delete_image(public_id: str):
    """
    Deletes an image from Cloudinary.
    """
    cloudinary.uploader.destroy(public_id)
