import { useState, useCallback, useMemo } from "react";

// ── Validation Rule Types ──────────────────────────────
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: { regex: RegExp; message: string };
  email?: boolean;
  match?: { field: string; message: string };
  custom?: (value: string, allValues: Record<string, string>) => string | null;
}

export type ValidationSchema = Record<string, ValidationRule>;

// ── Password Strength ──────────────────────────────────
export function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-400",
    "bg-emerald-500",
  ];

  const capped = Math.min(score, 4);
  return { score: capped, label: labels[capped], color: colors[capped] };
}

// ── Validator Functions ────────────────────────────────
function validateField(
  value: string,
  rules: ValidationRule,
  allValues: Record<string, string>
): string | null {
  if (rules.required && (!value || value.trim().length === 0)) {
    return "This field is required";
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Must be at most ${rules.maxLength} characters`;
  }

  if (value && rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
  }

  if (value && rules.pattern) {
    if (!rules.pattern.regex.test(value)) {
      return rules.pattern.message;
    }
  }

  if (value && rules.match) {
    if (value !== allValues[rules.match.field]) {
      return rules.match.message;
    }
  }

  if (rules.custom) {
    return rules.custom(value, allValues);
  }

  return null;
}

// ── Hook ───────────────────────────────────────────────
export function useFormValidation(schema: ValidationSchema) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const key of Object.keys(schema)) init[key] = "";
    return init;
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const errors = useMemo(() => {
    const errs: Record<string, string | null> = {};
    for (const [field, rules] of Object.entries(schema)) {
      errs[field] = validateField(values[field] || "", rules, values);
    }
    return errs;
  }, [values, schema]);

  const isValid = useMemo(() => {
    return Object.values(errors).every((e) => e === null);
  }, [errors]);

  const setValue = useCallback(
    (field: string, value: string) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setFieldTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const getFieldError = useCallback(
    (field: string): string | null => {
      if (!showAllErrors && !touched[field]) return null;
      return errors[field] || null;
    },
    [errors, touched, showAllErrors]
  );

  const validateAll = useCallback((): boolean => {
    setShowAllErrors(true);
    // Touch all fields
    const allTouched: Record<string, boolean> = {};
    for (const key of Object.keys(schema)) allTouched[key] = true;
    setTouched(allTouched);
    return Object.values(errors).every((e) => e === null);
  }, [errors, schema]);

  const reset = useCallback(() => {
    const init: Record<string, string> = {};
    for (const key of Object.keys(schema)) init[key] = "";
    setValues(init);
    setTouched({});
    setShowAllErrors(false);
  }, [schema]);

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    getFieldError,
    validateAll,
    reset,
  };
}
