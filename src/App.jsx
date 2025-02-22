import  { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Upload image & get result from backend
  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await fetch("http://127.0.0.1:8000/classify", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
  };

  // Reset uploader
  const resetUploader = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {/* Background blur only when result is displayed */}
      {result && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md z-10"></div>
      )}

      {/* Animated Banner */}
      <motion.div 
        className="text-center text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        ♻️ Waste Classification System
      </motion.div>

      {/* Custom File Upload Section */}
      {!image && (
        <motion.label
          className="border-dashed border-2 border-gray-400 p-10 rounded-lg cursor-pointer hover:bg-gray-800 transition flex flex-col items-center z-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <span className="text-lg">📷 Click to Upload Image</span>
        </motion.label>
      )}

      {/* Image Preview & Analyze Button */}
      {preview && (
        <motion.div
          className="mt-6 flex flex-col items-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded-lg shadow-lg" />
          <button 
            className="mt-4 px-6 py-3 bg-green-500 rounded-lg text-white font-bold hover:bg-green-700 transition"
            onClick={analyzeImage}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Waste"}
          </button>
        </motion.div>
      )}

      {/* Pop-up Modal with Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg shadow-xl text-center w-96 z-40"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-xl font-bold text-green-400 mb-4">Waste Classification Result</h2>
              <p><strong>Type:</strong> {result.waste_type}</p>
              <p><strong>Disposal:</strong> {result.disposal}</p>
              <p><strong>Caption:</strong> {result.caption || "No caption available"}</p>
              
              {/* Try Again Button */}
              <button
                className="mt-4 px-6 py-2 bg-red-500 rounded-lg text-white font-bold hover:bg-red-700 transition"
                onClick={resetUploader}
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
