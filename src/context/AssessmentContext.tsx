import React, { createContext, useContext, useState, useEffect } from "react";
import type { Assessment } from "../types/assessment";

interface AssessmentContextType {
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => void;
  getAssessmentById: (id: string) => Assessment | undefined;
  clearAssessments: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    // Clear any legacy demo data from localStorage on initialization
    try {
      const saved = localStorage.getItem("veda_session_assessments");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify items don't contain old demo data strings
          const clean = parsed.filter(
            (a: any) =>
              a.id &&
              !a.id.includes("biology") &&
              !a.title?.includes("Biology")
          );
          return clean;
        }
      }
    } catch (e) {
      console.warn("Failed to load session assessments", e);
    }
    return [];
  });

  // Clean up legacy demo keys from localStorage
  useEffect(() => {
    localStorage.removeItem("veda_user");
    localStorage.removeItem("demo_assessment");
  }, []);

  const addAssessment = (newAssessment: Assessment) => {
    setAssessments((prev) => {
      const updated = [newAssessment, ...prev.filter((a) => a.id !== newAssessment.id)];
      try {
        localStorage.setItem("veda_session_assessments", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist assessment session", e);
      }
      return updated;
    });
  };

  const getAssessmentById = (id: string) => {
    return assessments.find((a) => a.id === id);
  };

  const clearAssessments = () => {
    setAssessments([]);
    localStorage.removeItem("veda_session_assessments");
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        addAssessment,
        getAssessmentById,
        clearAssessments,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};
