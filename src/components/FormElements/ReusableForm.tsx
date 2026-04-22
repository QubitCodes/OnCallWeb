

"use client";
import { z } from "zod";
import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import './ReusableForm.css';

type SchemaShape = {
    [K in keyof typeof validationSchemas]: z.infer<typeof validationSchemas[K]>;
};

// Reusable image schema for optional file or string (URL)
const baseImageSchema = z.custom<File | string>()
    .optional()
    .nullable()
    .refine(value => {
        if (!value) return true; // Allow empty/null values
        if (typeof value === 'string') return true; // Allow string URLs
        return value instanceof File; // Allow File objects
    }, "Invalid image type");

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// Validation schemas for each form type
const validationSchemas = {
    speaker: z.object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name must be at most 255 characters"),
        title: z.string().trim().max(255, "Title must be at most 255 characters").optional().nullable(),
        description: z.string().trim().min(10, "Description must be at least 10 characters"),
        image: baseImageSchema,
        // featured: z.boolean().optional(),
    }),
    banner: z.object({
        title: z.string().trim().min(2, "Title must be at least 2 characters").max(255, "Title must be at most 255 characters"),
        subtitle: z.string().trim().min(2, "Subtitle must be at least 2 characters").max(255, "Subtitle must be at most 255 characters"),
        image: baseImageSchema.refine((value) => !!value, "Image is required"),
        description: z.string().trim().min(10, "Description must be at least 10 characters").max(1000, "Description must be at most 1000 characters").optional(),
        // featured: z.boolean().optional(),
    }),
    events: z.object({
        title: z.string().trim().min(2, "Title must be at least 2 characters").max(255, "Title must be at most 255 characters"),
        description: z.string().trim().min(10, "Description must be at least 10 characters"),
        location: z.string().trim().min(2, "Location must be at least 2 characters").max(25, "Location must be at most 25 characters"),
        time: z.string().trim().regex(timeRegex, "Invalid time format (HH:MM)"),
        date: z.coerce.date(),
        image: baseImageSchema,
        is_portfolio: z.boolean().default(false),
    }),
    role: z.object({
        name: z.string().trim().min(2, "Role name must be at least 2 characters").max(255, "Role name must be at most 255 characters"),
    }),
    user: z.object({
        fullName: z.string().trim().min(3, "Full name must be at least 3 characters").max(255, "Full name must be at most 255 characters"),
        email: z.string().trim().email("Invalid email format").max(254, "Email must be at most 254 characters"),
        phone: z.string().trim().regex(phoneRegex, "Invalid phone format").optional().nullable(),
        password: z.string().trim().min(6, "Password must be at least 6 characters").optional(),
        role_id: z.string().optional().nullable(),
    }),
    blog: z.object({
        user_id: z.string().optional(),
        title: z.string().trim().min(2, "Title must be at least 2 characters").max(255, "Title must be at most 255 characters"),
        slug: z.string().trim().min(2, "Slug must be at least 2 characters").max(255, "Slug must be at most 255 characters"),
        content: z.string().trim().min(10, "Content must be at least 10 characters"),
        excerpt: z.string().trim().optional().nullable(),
        image: baseImageSchema,
        thumbnail: baseImageSchema,
        featured: z.enum(["true", "false"]).optional(), // Keep enum validation for "true" or "false" strings
    }),
    service: z.object({
        title: z
          .string()
          .trim()
          .min(2, "Title must be at least 2 characters")
          .max(255, "Title must be at most 255 characters"),
        description: z
          .string()
          .trim()
          .min(10, "Description must be at least 10 characters")
          .max(1000, "Description must be at most 1000 characters"),
    }),
    gallery: z.object({
        title: z.string().trim().min(2, "Title must be at least 2 characters").max(255, "Title must be at most 255 characters"),
        image: baseImageSchema.refine(value => !!value, "Image is required"),
        subtitle: z.string().trim().optional().nullable(),
        url: z.string().trim().max(200, "URL must be at most 200 characters").optional().nullable(),
    }),
    contact: z.object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name must be at most 255 characters"),
        email: z.string().trim().email("Invalid email format").max(254, "Email must be at most 254 characters"),
        phone: z.string().trim().regex(phoneRegex, "Invalid phone format").optional().nullable(),
        service_type: z.string().trim().min(2, "Service type must be at least 2 characters").max(255, "Service type must be at most 255 characters"),
        message: z.string().trim().min(10, "Message must be at least 10 characters"),
        comment: z.string().trim().optional().nullable(),
    }),
    contactEdit: z.object({
    status: z.enum(['view', 'opened', 'replayed', 'need follow up', 'follow up scheduled', 'closed'] as const, {
      error: "Status is required"
    }),
    comments: z.string().optional().nullable(),
    followUpDate: z.string().optional().nullable()
      .transform(val => val === '' ? null : val),
    followUpTime: z.string().optional().nullable()
      .transform(val => val === '' ? null : val),
  }).refine((data) => {
    // If status is 'follow up scheduled', both date and time should be present
    if (data.status === 'follow up scheduled') {
      return data.followUpDate != null && data.followUpTime != null;
    }
    return true;
  }, {
    message: "Follow-up date and time are required when status is 'Follow Up Scheduled'",
    path: ['followUpDate'],
  }),
    testimonial: z.object({ 
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name must be at most 255 characters"),
        designation: z.string().trim().min(2, "Designation is required").max(255, "Designation must be at most 255 characters"),
        comment: z.string().trim().min(10, "Comment must be at least 10 characters"),
        rating: z.coerce.number().min(1).max(5), 
        image: baseImageSchema.refine(value => !!value, "Image is required"),
    }), 
};

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'file' | 'checkbox' | 'time';
    placeholder?: string;
    options?: { value: string, label: string }[];
    required?: boolean;
}

interface ReusableFormProps {
    fields: FormField[];
    initialValues?: any;
    onSubmit: (data: any) => Promise<void>;
    submitButtonText: string;
    formType: keyof typeof validationSchemas;
    isEditing?: boolean;
    id?: number;
    conditionalFields?: {
        [groupName: string]: {
            condition: (formData: any) => boolean;
            fields: string[];
        };
    };
    darkMode?: boolean;
}

const ReusableForm: React.FC<ReusableFormProps> = ({
    fields,
    initialValues,
    onSubmit,
    submitButtonText,
    formType,
    isEditing = false,
    id,
    conditionalFields,
    darkMode = false,
}) => {
    const [formData, setFormData] = useState<any>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialValues) {
            setFormData(initialValues);
        } else {
            const initialFormState: Record<string, any> = {};
            fields.forEach(field => {
                initialFormState[field.name] = '';
            });
            setFormData(initialFormState);
        }
    }, [initialValues, fields]);


    const validateField = (name: string, value: any) => {
        try {
            const schema = validationSchemas[formType];
            if (!schema) {
                console.warn(`No validation schema found for formType: ${formType}`);
                return;
            }
    
            // Create a partial schema for single field validation
            const partialData = { [name]: value };
            const partialSchema = z.object({
                [name]: (schema as any)._def.shape()[name]
            });
    
            partialSchema.parse(partialData);
            setErrors(prev => ({ ...prev, [name]: '' }));
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldError = (error as any).errors[0];
                if (fieldError) {
                    setErrors(prev => ({ ...prev, [name]: fieldError.message }));
                }
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target; // Destructure type, but not checked directly
        let parsedValue: any = value;
        let checkedValue: boolean | undefined; // Declare checkedValue to store checkbox state
    
        if (type === 'checkbox' && (e.target as HTMLInputElement).checked !== undefined) { // Type check and existence check for 'checked'
            checkedValue = (e.target as HTMLInputElement).checked; // Access 'checked' if it's a checkbox
            parsedValue = checkedValue; // Set parsedValue to the boolean 'checked' value
        } else if (formType === 'events' && name === 'is_portfolio') {
            parsedValue = value === 'true';
        } else if (formType === 'blog' && name === 'featured') {
            parsedValue = value; // ⭐️ Keep value as string "true" or "false" from select
        }
    
        setFormData((prev: any) => ({ ...prev, [name]: parsedValue }));
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, parsedValue);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData((prev: any) => ({ ...prev, [name]: files[0] }));
            setTouched(prev => ({ ...prev, [name]: true }));
            validateField(name, files[0]);
        }
    };

    const handleBlur = (name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault();
              setIsSubmitting(true);

              const isEditing = !!initialValues;
              if (formType === 'user' && !isEditing && !formData.password) {
                setErrors(prev => ({ ...prev, password: "Password is required" }));
                setIsSubmitting(false);
                const passwordField = document.querySelector('input[name="password"]');
                passwordField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
      
              // Mark all fields as touched for validation on submit
              const newTouched = fields.reduce((acc, field) => ({
                ...acc,
                [field.name]: true
              }), {});
              setTouched(newTouched);
      
              try {
                const schema = validationSchemas[formType];
                 if (!schema) {
                  console.warn(`No validation schema found for formType: ${formType} in handleSubmit`); // LOG 11: Missing Schema in Submit
                  return; // Exit if no schema
                }
                await schema.parseAsync(formData); // Validate entire form
                await onSubmit(formData); // Only call onSubmit if validation passes
              } catch (error) {
                if (error instanceof z.ZodError) {
                  console.error("ZodError in handleSubmit:", error); // LOG 14: Zod Error in Submit
                  const newErrors: Record<string, string> = {};
                  (error as any).errors.forEach((err: any) => {
                    if (err.path[0]) {
                      newErrors[err.path[0]] = err.message;
                    }
                  });
                  setErrors(newErrors);
      
                  // Scroll to first error field
                  const firstErrorField = document.querySelector('.error-field');
                  firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              } finally {
                setIsSubmitting(false);
              }
          };

          return (
            <form onSubmit={handleSubmit} className="reusable-form">
                {fields.map((field, index) => {
                    const hasError = touched[field.name] && errors[field.name];
                    const isConditionalFieldHidden = conditionalFields && Object.values(conditionalFields).some(group => group.fields.includes(field.name) && !group.condition(formData));
    
                    if (isConditionalFieldHidden) {
                        return null;
                    }
    
                    return (
                        <div
                            className={`form-field ${hasError ? 'error-field' : ''}`}
                            key={index}
                        >
                            <label
                                htmlFor={field.name}
                                className={`form-label ${darkMode ? 'dark' : ''}`}
                            >
                                {field.label}
                                {field.required && <span className="form-required">*</span>}
                            </label>
    
                            <div className="form-input-wrapper">
                                {field.type === 'textarea' ? (
                                    <textarea
                                        id={field.name}
                                        name={field.name}
                                        rows={4}
                                        placeholder={field.placeholder || field.label}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur(field.name)}
                                        className={`form-input form-textarea ${hasError ? 'error' : ''} ${darkMode ? 'dark' : ''}`}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name] || ''} // ✅ Bind value to formData
                                        onChange={handleChange}
                                        onBlur={() => handleBlur(field.name)}
                                        className={`form-input form-select ${hasError ? 'error' : ''} ${darkMode ? 'dark' : ''}`}
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.type === 'file' ? (
                                    <div className={`form-file-wrapper ${hasError ? 'error' : ''} ${darkMode ? 'dark' : ''}`}>
                                        <div className="form-file-container">
                                            <input
                                                type="file"
                                                id={field.name}
                                                name={field.name}
                                                onChange={handleFileChange}
                                                onBlur={() => handleBlur(field.name)}
                                                className={`form-file-input ${darkMode ? 'dark' : ''}`}
                                            />
                                        </div>
                                    </div>
                                ) : field.type === 'checkbox' ? (
                                    <div className="form-checkbox-wrapper" key={index}>
                                        <div className="form-checkbox-container">
                                            <div className="form-checkbox-input-wrapper">
                                                <input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="checkbox" // type="checkbox"
                                                    checked={formData[field.name] || false} // Use 'checked' and bind to formData (default to false)
                                                    onChange={handleChange}
                                                    onBlur={() => handleBlur(field.name)}
                                                    className={`form-checkbox ${hasError ? 'error' : ''} ${darkMode ? 'dark' : ''}`}
                                                />
                                            </div>
                                            <div className="form-checkbox-label-wrapper">
                                                <label htmlFor={field.name} className={`form-checkbox-label ${darkMode ? 'dark' : ''}`}>
                                                    {field.label}
                                                </label>
                                                {hasError && (
                                                    <div className="form-error">
                                                        <AlertCircle className="form-error-icon" />
                                                        <span className="form-error-text">{errors[field.name]}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type={field.type}
                                        id={field.name}
                                        name={field.name}
                                        placeholder={field.placeholder || field.label}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur(field.name)}
                                        className={`form-input ${hasError ? 'error' : ''} ${darkMode ? 'dark' : ''}`}
                                    />
                                )}
    
                                {hasError && field.type !== 'checkbox' && (
                                    <div className="form-error">
                                        <AlertCircle className="form-error-icon" />
                                        <span className="form-error-text">{errors[field.name]}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
    
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="form-submit-button"
                >
                    {isSubmitting ? 'Submitting...' : submitButtonText}
                </button>
            </form>
        );
};

export default ReusableForm;