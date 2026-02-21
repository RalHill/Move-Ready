"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CrewStatus } from "@/types/domain";
import {
  addCrewSchema,
  step1Schema,
  step2Schema,
  step3Schema,
  type AddCrewFormData,
} from "@/lib/validations/crew";
import toast from "react-hot-toast";

interface AddCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrewAdded: () => void;
}

export function AddCrewModal({
  isOpen,
  onClose,
  onCrewAdded,
}: AddCrewModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AddCrewFormData>>({
    startLat: 43.6532,
    startLng: -79.3832,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  function handleClose() {
    if (!isSubmitting) {
      onClose();
      setTimeout(() => {
        setCurrentStep(1);
        setFormData({ startLat: 43.6532, startLng: -79.3832 });
        setErrors({});
      }, 300);
    }
  }

  function validateStep(step: number): boolean {
    setErrors({});
    try {
      if (step === 1) {
        step1Schema.parse(formData);
      } else if (step === 2) {
        step2Schema.parse(formData);
      } else if (step === 3) {
        step3Schema.parse(formData);
      }
      return true;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errors" in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        const newErrors: Record<string, string> = {};
        zodError.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;

    try {
      const validated = addCrewSchema.parse(formData);
      setIsSubmitting(true);

      const supabase = createClient();
      const { error } = await supabase.from("crews").insert({
        name: validated.name,
        status: validated.initialStatus as CrewStatus,
        current_lat: validated.startLat,
        current_lng: validated.startLng,
      });

      if (error) throw error;

      toast.success(`Crew "${validated.name}" added successfully!`);
      onCrewAdded();
      handleClose();
    } catch (error) {
      toast.error("Failed to add crew. Please try again.");
      console.error("Add crew error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const steps = [
    { number: 1, title: "Basic Info", subtitle: "Name & Contact" },
    { number: 2, title: "Vehicle Details", subtitle: "Type & Plate" },
    { number: 3, title: "Initial Status", subtitle: "Availability" },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Add New Crew
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Step {currentStep} of 3: {steps[currentStep - 1].subtitle}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center justify-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep > step.number
                      ? "bg-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check size={18} />
                  ) : (
                    step.number
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      currentStep > step.number
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="p-6 min-h-[300px]">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Crew Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Crew Alpha"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="4165551234"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    10 digits only, no dashes or spaces
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["truck", "van", "suv"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, vehicleType: type })
                        }
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.vehicleType === type
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  {errors.vehicleType && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.vehicleType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    License Plate *
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licensePlate: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ABC1234"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 uppercase"
                  />
                  {errors.licensePlate && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.licensePlate}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Status *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["available", "offline"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, initialStatus: status })
                        }
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.initialStatus === status
                            ? status === "available"
                              ? "border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600"
                              : "border-gray-600 bg-gray-50 dark:bg-gray-900/20 text-gray-600"
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {status === "available" ? "Available" : "Offline"}
                      </button>
                    ))}
                  </div>
                  {errors.initialStatus && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.initialStatus}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Starting Location
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={formData.startLat || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startLat: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Latitude"
                        step="0.0001"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.startLng || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startLng: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Longitude"
                        step="0.0001"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Default: Toronto (43.6532, -79.3832)
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Review Details
                  </h4>
                  <dl className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Name:</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-100">
                        {formData.name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Phone:</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-100">
                        {formData.phone}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Vehicle:</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {formData.vehicleType}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600 dark:text-gray-400">Plate:</dt>
                      <dd className="font-medium text-gray-900 dark:text-gray-100">
                        {formData.licensePlate}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40"
              >
                Cancel
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-lg transition-all"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 active:scale-98 text-white rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Add Crew
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
