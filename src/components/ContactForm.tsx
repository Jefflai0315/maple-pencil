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
    couponCode: "",
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
      console.log("response", response);
      console.log("formPayload", formPayload);

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
        coupon_code: formData.couponCode || "",
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
    console.log("formData", formData);

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
          couponCode: "",
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
    <div className="w-full border-t-4 pt-4 border-charcoal-light">
      <h3 className="font-handwritten text-2xl font-semibold text-charcoal mb-6">
        Order a Custom Sketch
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-sketch text-charcoal-medium mb-2 block">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your name"
              className="sketch-input w-full"
            />
          </div>
          <div>
            <label className="font-sketch text-charcoal-medium mb-2 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="your.email@example.com"
              className="sketch-input w-full"
            />
          </div>
        </div>

        <div>
          <label className="font-sketch text-charcoal-medium mb-2 block">
            Mobile Number
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            placeholder="+65 9888 8888"
            className="sketch-input w-full"
          />
        </div>

        <div>
          <label className="font-sketch text-charcoal-medium mb-2 block">
            What would you like sketched?
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Please describe what you'd like me to sketch..."
            className="sketch-input w-full"
          />
        </div>

        <div className="form-section bg-paper-white p-4 rounded-md border-2 border-charcoal-light">
          <label className="font-sketch text-charcoal-medium mb-3 block">
            Do you have a reference photo?
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 text-charcoal-medium cursor-pointer">
              <input
                type="radio"
                name="reference"
                value="yes"
                checked={formData.reference === "yes"}
                onChange={handleInputChange}
                className="w-4 h-4 text-charcoal-medium focus:ring-charcoal-medium cursor-pointer"
              />
              <span className="font-body">Yes</span>
            </label>
            <label className="flex items-center gap-3 text-charcoal-medium cursor-pointer">
              <input
                type="radio"
                name="reference"
                value="no"
                checked={formData.reference === "no"}
                onChange={handleInputChange}
                className="w-4 h-4 text-charcoal-medium focus:ring-charcoal-medium cursor-pointer"
              />
              <span className="font-body">No</span>
            </label>
          </div>
        </div>

        {formData.reference === "yes" && (
          <div className="form-section bg-paper-white p-4 rounded-md border-2 border-charcoal-light">
            <label className="font-sketch text-charcoal-medium mb-3 block">
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
                className="sketch-btn"
              >
                Select Photos
              </button>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group bg-paper-white rounded-md p-2 border-2 border-charcoal-light transform rotate-1 hover:rotate-0 transition-transform"
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
                    <p className="text-sm text-charcoal-medium mt-2 truncate font-body">
                      {photo.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div>
          <label className="font-sketch text-charcoal-medium mb-2 block">
            Coupon Code (Optional)
          </label>
          <input
            type="text"
            name="couponCode"
            value={formData.couponCode}
            onChange={handleInputChange}
            placeholder="Enter your discount code"
            className="sketch-input w-full"
          />
        </div>

        {formStatus.message && (
          <div
            className={`text-center text-lg p-4 rounded-md border-2 ${
              formStatus.success
                ? "bg-green-500/20 text-green-600 border-green-400"
                : "bg-red-500/20 text-red-600 border-red-400"
            }`}
          >
            {formStatus.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="sketch-btn w-full text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};
