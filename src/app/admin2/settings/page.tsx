

'use client';

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "@/lib/api";
import { API_URL } from "@/config/api";
import { toast } from "react-toastify";


const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for personal info form
  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.user?.fullName || "",
    phone: user?.user?.phone || "",
  });

  // State for password reset form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // State for validation errors in password reset form
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // Update personal info when user changes
  useEffect(() => {
    console.log(user)
    if (user) {
      setPersonalInfo({
        full_name: user.fullName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Handle personal info input changes
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password reset input changes with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Perform validation on change
    const newErrors = { ...passwordErrors };

    if (name === "currentPassword") {
      newErrors.currentPassword = value.trim() ? "" : "Current password is required.";
    }

    if (name === "newPassword") {
      if (!value.trim()) {
        newErrors.newPassword = "New password is required.";
      } else if (value.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters long.";
      } else {
        newErrors.newPassword = "";
      }
      // Re-validate confirm password if it exists
      if (passwordData.confirmNewPassword) {
        newErrors.confirmNewPassword =
          value === passwordData.confirmNewPassword
            ? ""
            : "New password and confirm password do not match.";
      }
    }

    if (name === "confirmNewPassword") {
      if (!value.trim()) {
        newErrors.confirmNewPassword = "Confirm password is required.";
      } else if (value !== passwordData.newPassword) {
        newErrors.confirmNewPassword = "New password and confirm password do not match.";
      } else {
        newErrors.confirmNewPassword = "";
      }
    }

    setPasswordErrors(newErrors);
  };

  // Handle personal info form submission
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${API_URL}/users/${user?.user?.id}`, personalInfo, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.statusCode === 200) {
        toast.success("Personal information updated successfully!");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update personal information.");
      toast.error("Failed to update personal information.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset form submission with validation
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    let newErrors = { ...passwordErrors };

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required.";
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = "New password is required.";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters long.";
    }

    if (!passwordData.confirmNewPassword.trim()) {
      newErrors.confirmNewPassword = "Confirm password is required.";
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "New password and confirm password do not match.";
    }

    setPasswordErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) {
      setError("Please fix the errors in the form before submitting.");
      return;
    }

    // If no errors, proceed with API call
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/reset-password`,
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.statusCode === 200) {
        toast.success("Password reset successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
        setPasswordErrors({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
      toast.error("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Settings" />

        <div className="grid grid-cols-5 gap-8">
          {/* Personal Information Section */}
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Personal Information</h3>
              </div>
              <div className="p-7">
                {error && <div className="mb-4 text-red-600">{error}</div>}
                <form onSubmit={handlePersonalInfoSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="full_name"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          type="text"
                          name="full_name"
                          id="full_name"
                          placeholder="Enter full name"
                          value={personalInfo.full_name}
                          onChange={handlePersonalInfoChange}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                        htmlFor="phone"
                      >
                        Phone Number
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="Enter phone number"
                        value={personalInfo.phone}
                        onChange={handlePersonalInfoChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => setPersonalInfo({ full_name: user?.user?.fullName || "", phone: user?.user?.phone || "" })}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Reset Password Section */}
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Reset Password</h3>
              </div>
              <div className="p-7">
                <form onSubmit={handlePasswordResetSubmit}>
                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="currentPassword"
                    >
                      Current Password
                    </label>
                    <input
                      className={`w-full rounded border ${
                        passwordErrors.currentPassword ? "border-red-500" : "border-stroke"
                      } bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary`}
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="newPassword"
                    >
                      New Password
                    </label>
                    <input
                      className={`w-full rounded border ${
                        passwordErrors.newPassword ? "border-red-500" : "border-stroke"
                      } bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary`}
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="confirmNewPassword"
                    >
                      Confirm New Password
                    </label>
                    <input
                      className={`w-full rounded border ${
                        passwordErrors.confirmNewPassword ? "border-red-500" : "border-stroke"
                      } bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary`}
                      type="password"
                      name="confirmNewPassword"
                      id="confirmNewPassword"
                      placeholder="Confirm new password"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    {passwordErrors.confirmNewPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmNewPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                      type="button"
                      onClick={() => {
                        setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                        setPasswordErrors({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Settings;