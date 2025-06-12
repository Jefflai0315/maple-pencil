import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import Image from "next/image";

// Helper function to convert File to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const ContactForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
    reference: "yes",
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<
    Array<{ preview: string; name: string; file: File }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  }>({
    submitted: false,
    success: false,
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map((file) => ({
      preview: URL.createObjectURL(file),
      name: file.name,
      file: file,
    }));

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  // Function to submit to Google Sheets
  const submitToGoogleSheets = async () => {
    try {
      // 1) convert each File to a base64 blob
      const photoData = await Promise.all(
        uploadedPhotos.map(async (photo) => {
          const base64Data = await convertFileToBase64(photo.file);
          return {
            name: photo.file.name,
            type: photo.file.type,
            base64Data,
          };
        })
      );

      // 2) build the payload with full photo objects
      const formPayload = {
        ...formData,
        photoCount: uploadedPhotos.length,
        photoNames: uploadedPhotos.length
          ? uploadedPhotos.map((p) => p.file.name).join(", ")
          : "None",
        photos: photoData,
      };

      // 3) POST to our Next.js API route instead of directly to Google Apps Script
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Form submission error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.message ||
            `Failed to submit form: ${response.status} ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error submitting to Google Sheets:", error);
      return false;
    }
  };

  // Function to submit via email service (EmailJS)
  const submitViaEmail = async () => {
    try {
      // Send the form data in the first email
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        mobile: formData.mobile || "Not provided",
        reference: formData.reference,
        photo_count: uploadedPhotos.length,
        photo_names:
          uploadedPhotos.length > 0
            ? uploadedPhotos.map((p) => p.file.name).join(", ")
            : "None",
      };

      // Send initial email with form data
      const emailResult = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID!
      );

      if (emailResult.status !== 200) {
        throw new Error("Email submission failed");
      }

      console.log("Form submitted via email successfully");
      return true;
    } catch (error) {
      console.error("Error submitting via email:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.message) {
        setFormStatus({
          submitted: false,
          success: false,
          message: "Please fill in all required fields",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setFormStatus({
          submitted: false,
          success: false,
          message: "Please enter a valid email address",
        });
        setIsSubmitting(false);
        return;
      }

      // First, try to submit to Google Sheets
      let submissionSuccess = await submitToGoogleSheets();

      // If Google Sheets submission fails, try email as backup
      if (!submissionSuccess) {
        submissionSuccess = await submitViaEmail();
      }

      if (submissionSuccess) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          mobile: "",
          message: "",
          reference: "yes",
        });

        // Clean up uploaded photos
        uploadedPhotos.forEach((photo) => {
          URL.revokeObjectURL(photo.preview);
        });
        setUploadedPhotos([]);

        // Set success message
        setFormStatus({
          submitted: true,
          success: true,
          message: "Your message has been sent! I will get back to you soon.",
        });
      } else {
        // Set error message if both submission methods fail
        setFormStatus({
          submitted: false,
          success: false,
          message:
            "Failed to send your message. Please try again or contact me directly.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus({
        submitted: false,
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-gradient-to-b from-[#4a90e2] to-[#2c5282] rounded-lg border-4 border-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.3)]">
      <div className="contact-info mb-10">
        <h2 className="text-3xl font-bold text-[#ffd700] mb-4 text-center font-['Press_Start_2P'] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
          Commission a Custom Portrait
        </h2>
        <p className="text-[#ffffff] text-lg mb-6 text-center drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
          I&apos;d love to create a custom sketch for you. Please share some
          details about what you have in mind.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["Portrait", "Family", "Pet", "Couple", "Custom"].map((tag) => (
            <div
              key={tag}
              className="px-4 py-2 bg-[#ff6b6b] hover:bg-[#ff8787] rounded-md text-sm text-white transition-colors duration-300 cursor-pointer border-2 border-[#ffd700] font-['Press_Start_2P'] text-xs drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="form-group">
            <label
              htmlFor="name"
              className="block text-lg font-medium text-[#ffd700] mb-3 font-['Press_Start_2P'] text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
            >
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/90 border-2 border-[#ffd700] rounded-md focus:outline-none focus:border-[#ffd700] text-[#2c5282] text-lg placeholder-gray-400 transition-colors duration-300"
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="email"
              className="block text-lg font-medium text-[#ffd700] mb-3 font-['Press_Start_2P'] text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/90 border-2 border-[#ffd700] rounded-md focus:outline-none focus:border-[#ffd700] text-[#2c5282] text-lg placeholder-gray-400 transition-colors duration-300"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label
            htmlFor="mobile"
            className="block text-lg font-medium text-[#ffd700] mb-3 font-['Press_Start_2P'] text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
          >
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white/90 border-2 border-[#ffd700] rounded-md focus:outline-none focus:border-[#ffd700] text-[#2c5282] text-lg placeholder-gray-400 transition-colors duration-300"
            placeholder="+65 9888 8888"
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="message"
            className="block text-lg font-medium text-[#ffd700] mb-3 font-['Press_Start_2P'] text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
          >
            What would you like sketched?
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-4 py-3 bg-white/90 border-2 border-[#ffd700] rounded-md focus:outline-none focus:border-[#ffd700] text-[#2c5282] text-lg placeholder-gray-400 resize-none transition-colors duration-300"
            placeholder="Please describe what you'd like me to sketch..."
          />
        </div>

        <div className="form-group bg-white/90 p-4 rounded-md border-2 border-[#ffd700]">
          <label className="block text-lg font-medium text-[#ffd700] mb-3 font-['Press_Start_2P'] text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
            Do you have a reference photo?
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 text-[#2c5282] text-lg cursor-pointer">
              <input
                type="radio"
                name="reference"
                value="yes"
                checked={formData.reference === "yes"}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#ffd700] focus:ring-[#ffd700] cursor-pointer"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-3 text-[#2c5282] text-lg cursor-pointer">
              <input
                type="radio"
                name="reference"
                value="no"
                checked={formData.reference === "no"}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#ffd700] focus:ring-[#ffd700] cursor-pointer"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {formData.reference === "yes" && (
          <div className="form-group bg-white/90 p-4 rounded-md border-2 border-[#ffd700]">
            <label className="block text-lg font-medium text-[#ffd700] mb-3 font-['Press_Start_2P'] text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              Upload Reference Photos
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-6 py-3 bg-[#ff6b6b] hover:bg-[#ff8787] rounded-md text-white text-lg transition-colors duration-300 border-2 border-[#ffd700] font-['Press_Start_2P'] text-sm drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
              >
                Select Photos
              </button>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group bg-white rounded-md p-2 border-2 border-[#ffd700]"
                  >
                    <Image
                      src={photo.preview}
                      alt={`Preview ${index}`}
                      width={100}
                      height={100}
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      ×
                    </button>
                    <p className="text-sm text-[#2c5282] mt-2 truncate">
                      {photo.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {formStatus.message && (
          <div
            className={`text-center text-lg p-4 rounded-md border-2 ${
              formStatus.success
                ? "bg-green-500/20 text-green-400 border-green-400"
                : "bg-red-500/20 text-red-400 border-red-400"
            }`}
          >
            {formStatus.message}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#ff6b6b] hover:bg-[#ff8787] text-white font-bold rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-['Press_Start_2P'] text-sm border-2 border-[#ffd700] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]"
          >
            {isSubmitting ? "Sending..." : "Send Request"}
          </button>
        </div>
      </form>
    </div>
  );
};
