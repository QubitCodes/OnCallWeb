"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { API_URL } from "@/config/api";
import axios from "@/lib/api";

// Import icons
import {
  Mail,
  Phone,
  MapPin,
  Home,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  Users,
  Save,
  Info,
} from "lucide-react";

// Define the Setting interface to match API response
interface Setting {
  key: string;
  value: string | null;
  createdAt: string;
  updatedAt: string;
}

// Field validation types
type ValidationRule = {
  pattern?: RegExp;
  message: string;
  required?: boolean;
};

// Define validation rules for each field type
const validationRules: Record<string, ValidationRule> = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address",
  },
  phone: {
    pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
    message: "Please enter a valid phone number",
  },
  url: {
    pattern: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    message: "Please enter a valid URL",
  },
};

// Group settings by category for better organization
interface SettingsGroups {
  emails: string[];
  contact: string[];
  social: string[];
  recipients: string[];
}

// Setting field definitions with more metadata
interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel" | "url";
  icon: React.ReactNode;
  description?: string;
  validation?: "email" | "phone" | "url";
  required?: boolean;
}

// Define field groupings with more information
const settingFields: Record<string, SettingField[]> = {
  emails: [
    {
      key: "email_handler_1",
      label: "Email #1",
      placeholder: "primary@example.com",
      type: "email",
      icon: <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      description: "Main contact email displayed on the website",
      validation: "email",
      required: true,
    },
    {
      key: "email_handler_2",
      label: "Email #2",
      placeholder: "secondary@example.com",
      type: "email",
      icon: <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      description: "Alternative contact email (optional)",
      validation: "email",
    },
    {
      key: "email_handler_3",
      label: "Email #3",
      placeholder: "tertiary@example.com",
      type: "email",
      icon: <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      description: "Additional contact email (optional)",
      validation: "email",
    },
  ],
  contact: [
    {
      key: "phone_handler",
      label: "Phone Number",
      placeholder: "+1 (555) 123-4567",
      type: "tel",
      icon: <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      description: "Main contact phone number",
      validation: "phone",
      required: true,
    },
    {
      key: "short_address",
      label: "Short Address",
      placeholder: "City, Country",
      type: "text",
      icon: <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      description: "Brief location shown in footer",
    },
    {
      key: "full_address",
      label: "Full Address",
      placeholder: "123 Street Name, City, State, Country",
      type: "text",
      icon: <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      description: "Complete address for contact page",
    },
  ],
  social: [
    {
      key: "facebook_handler",
      label: "Facebook URL",
      placeholder: "https://facebook.com/yourbusiness",
      type: "url",
      icon: <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      validation: "url",
      description: "Full URL to your Facebook page",
    },
    {
      key: "linkedin_handler",
      label: "LinkedIn URL",
      placeholder: "https://linkedin.com/company/yourbusiness",
      type: "url",
      icon: <Linkedin className="h-5 w-5 text-blue-700 dark:text-blue-500" />,
      validation: "url",
      description: "Full URL to your LinkedIn page",
    },
    {
      key: "x_handler",
      label: "X (Twitter) URL",
      placeholder: "https://x.com/yourbusiness",
      type: "url",
      icon: <Twitter className="h-5 w-5 text-gray-800 dark:text-gray-200" />,
      validation: "url",
      description: "Full URL to your X/Twitter profile",
    },
    {
      key: "instagram_handler",
      label: "Instagram URL",
      placeholder: "https://instagram.com/yourbusiness",
      type: "url",
      icon: <Instagram className="h-5 w-5 text-pink-600 dark:text-pink-400" />,
      validation: "url",
      description: "Full URL to your Instagram profile",
    },
  ],
  recipients: [
    {
      key: "contact_recipent_1",
      label: "Recipient #1",
      placeholder: "primary@yourbusiness.com",
      type: "email",
      icon: <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      validation: "email",
      description: "Email address to receive form submissions",
      required: true,
    },
    {
      key: "contact_recipent_2",
      label: "Recipient #2",
      placeholder: "secondary@yourbusiness.com",
      type: "email",
      icon: <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      validation: "email",
      description: "Additional recipient for form submissions",
    },
    {
      key: "contact_recipent_3",
      label: "Recipient #3",
      placeholder: "tertiary@yourbusiness.com",
      type: "email",
      icon: <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
      validation: "email",
      description: "Additional recipient for form submissions",
    },
  ],
};

// Get all field keys
const getAllFieldKeys = () => {
  const keys: string[] = [];
  Object.values(settingFields).forEach(group => {
    group.forEach(field => keys.push(field.key));
  });
  return keys;
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get all setting keys
  const allSettingKeys = getAllFieldKeys();

  // Validate a single field
  const validateField = (key: string, value: string): string => {
    // Find the field definition
    let field: SettingField | undefined;
    for (const group of Object.values(settingFields)) {
      const found = group.find(f => f.key === key);
      if (found) {
        field = found;
        break;
      }
    }

    if (!field) return "";

    // Check if required
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    // If has validation rule and value is not empty
    if (field.validation && value.trim()) {
      const rule = validationRules[field.validation];
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message;
      }
    }

    return "";
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    for (const key of allSettingKeys) {
      const errorMessage = validateField(key, settings[key] || "");
      if (errorMessage) {
        newErrors[key] = errorMessage;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Fetch settings from API
  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/settings`);
      
      // Create a mapping of key to value
      const settingsMap: Record<string, string> = {};
      
      // First initialize all expected keys with empty strings
      allSettingKeys.forEach(key => {
        settingsMap[key] = "";
      });
      
      // Then fill in any existing values from the API
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((setting: Setting) => {
          // Only consider settings that are in our predefined list
          if (allSettingKeys.includes(setting.key)) {
            settingsMap[setting.key] = setting.value || "";
          }
        });
      }
      
      setSettings(settingsMap);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setError("Failed to load settings. Please try again later.");
      
      // Even on error, initialize empty settings so the form is usable
      const emptySettings: Record<string, string> = {};
      allSettingKeys.forEach(key => {
        emptySettings[key] = "";
      });
      setSettings(emptySettings);
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [key]: true
    }));
    
    // Validate field on change
    const errorMessage = validateField(key, value);
    setErrors(prev => ({
      ...prev,
      [key]: errorMessage
    }));
  };

  // Handle input blur
  const handleBlur = (key: string) => {
    setTouched(prev => ({
      ...prev,
      [key]: true
    }));
    
    // Validate on blur
    const errorMessage = validateField(key, settings[key] || "");
    setErrors(prev => ({
      ...prev,
      [key]: errorMessage
    }));
  };

  // Save all settings
  const handleSaveSettings = async () => {
    // Validate all fields before saving
    const isValid = validateAllFields();
    if (!isValid) {
      // Mark all fields as touched to show errors
      const allTouched: Record<string, boolean> = {};
      allSettingKeys.forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      
      setError("Please fix the errors before saving.");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Create an array of settings to update
      const settingsToUpdate = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value || null
      }));
      
      // Using batch update for efficiency - this will create settings if they don't exist
      const response = await axios.post(`${API_URL}/settings/batch`, { settings: settingsToUpdate });
      
      // Refresh the settings with the values from the response
      if (response.data.data && Array.isArray(response.data.data)) {
        const updatedSettings: Record<string, string> = {...settings};
        response.data.data.forEach((setting: Setting) => {
          updatedSettings[setting.key] = setting.value || "";
        });
        setSettings(updatedSettings);
      }
      
      setSuccessMessage("Settings saved successfully!");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError("Failed to save settings. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  // Render a settings group
  const renderSettingsGroup = (title: string, fields: SettingField[]) => (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-7.5">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">{title}</h3>
      </div>
      <div className="p-6.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(field => (
            <div key={field.key} className="mb-2 flex flex-col">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                {field.label}
                {field.required && <span className="text-danger ml-1">*</span>}
              </label>
              
              <div className="relative">
                <div className="absolute left-4 top-4">
                  {field.icon}
                </div>
                
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={settings[field.key] || ""}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                  className={`w-full rounded-lg border bg-transparent py-3 pl-12 pr-4 outline-none transition ${
                    touched[field.key] && errors[field.key] 
                      ? 'border-danger focus:border-danger active:border-danger' 
                      : 'border-stroke focus:border-primary active:border-primary'
                  } dark:border-form-strokedark dark:bg-form-input dark:text-white`}
                />
                
                {field.description && (
                  <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Info className="h-3.5 w-3.5 mr-1 inline-block" />
                    {field.description}
                  </div>
                )}
                
                {touched[field.key] && errors[field.key] && (
                  <div className="mt-1 text-xs text-danger">
                    {errors[field.key]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Site Settings" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">General Information</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your website's contact information and social media links. These settings are used throughout your website.
        </p>
      </div>

      {isLoading ? (
        <div className="my-8 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      ) : (
        <>
          {error && (
            <div className="my-4 p-4 rounded bg-red-50 border border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="my-4 p-4 rounded bg-green-50 border border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 gap-7.5">
            {renderSettingsGroup("Contact Email Addresses", settingFields.emails)}
            {renderSettingsGroup("Contact Information", settingFields.contact)}
            {renderSettingsGroup("Social Media Links", settingFields.social)}
            {renderSettingsGroup("Contact Form Recipients", settingFields.recipients)}

            <div className="sticky bottom-0 bg-white dark:bg-boxdark border-t border-stroke dark:border-strokedark py-4 px-6.5 mt-4 -mx-6.5 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center justify-center rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90 disabled:bg-opacity-70"
              >
                {isSaving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save All Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </DefaultLayout>
  );
};

export default SettingsPage;