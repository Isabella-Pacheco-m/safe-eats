import React from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { extractTextFromImage } from '../utils/vision';

interface Props {
  onTextExtracted: (text: string, imageUrl: string) => void;
}

export default function ImageUploader({ onTextExtracted }: Props) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    try {
      const imageUrl = URL.createObjectURL(file);
      const extractedText = await extractTextFromImage(file);
      
      if (extractedText.trim()) {
        onTextExtracted(extractedText, imageUrl);
      } else {
        alert('No text was detected in the image. Please try another image.');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block w-full">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processImage(file);
            }}
            className="hidden"
            disabled={isProcessing}
          />
          <div 
            className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
              isProcessing
                ? 'border-gray-200 cursor-not-allowed'
                : 'border-gray-300 cursor-pointer hover:border-blue-500'
            }`}
          >
            {isProcessing ? (
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">Processing image...</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click or drag image to upload</p>
              </div>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}