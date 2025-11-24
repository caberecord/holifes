"use client";
import { useEventWizardStore } from "@/store/eventWizardStore";
import Step1BasicInfo from "./Steps/Step1BasicInfo";
import Step2PlanSelection from "./Steps/Step2PlanSelection";
import Step3Distribution from "./Steps/Step3Distribution";
import Step4VenueDesign from "./Steps/Step4VenueDesign";
import { Check, ChevronRight } from "lucide-react";

const steps = [
    { id: 1, name: "Información Básica" },
    { id: 2, name: "Selección de Plan" },
    { id: 3, name: "Distribución y Venta" },
    { id: 4, name: "Diseño de Escenario" },
];

export default function CreateEventWizard() {
    const { currentStep } = useEventWizardStore();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                    <div
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-600 -z-10 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.id < currentStep
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : step.id === currentStep
                                        ? "border-indigo-600 text-indigo-600 bg-white"
                                        : "border-gray-300 text-gray-400 bg-white"
                                    }`}
                            >
                                {step.id < currentStep ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <span className="font-semibold">{step.id}</span>
                                )}
                            </div>
                            <span
                                className={`mt-2 text-sm font-medium ${step.id <= currentStep ? "text-indigo-600" : "text-gray-500"
                                    }`}
                            >
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[500px]">
                {currentStep === 1 && <Step1BasicInfo />}
                {currentStep === 2 && <Step2PlanSelection />}
                {currentStep === 3 && <Step3Distribution />}
                {currentStep === 4 && <Step4VenueDesign />}
            </div>
        </div>
    );
}
