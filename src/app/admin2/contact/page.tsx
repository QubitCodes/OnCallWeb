

"use client";
import React, { useState, useEffect, useCallback } from "react";
import ContactBreadcrumb from "./ContactBreadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import TableThree, { Column } from "@/components/Tables/TableThree";
import Modal from "@/components/FormElements/Modal";
import { formatDate } from "@/utils/formatters";
import { FormField } from "@/components/FormElements/ReusableForm";
import ReusableForm from "@/components/FormElements/ReusableForm";
import { API_URL } from "@/config/api";
import axios from "@/lib/api";
// import "./contact.css";

// Define the Contact interface to match API response
interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  serviceType: string;
  message: string;
  status: ContactStatus;
  comment: string | null;
  followUpDate: string | null;
  followUpTime: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

type ContactStatus =
  | "view"
  | "opened"
  | "replayed"
  | "need follow up"
  | "follow up scheduled"
  | "closed";

const ContactPage = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactData, setContactData] = useState<Contact[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fetch contacts with pagination
  const fetchContacts = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null); // Reset error state on new fetch
    try {
      const response = await axios.get(`${API_URL}/contacts`, {
        params: { page, per_page: perPage },
      });
      console.log(response)
      setContactData(response?.data?.data);
      const pagination = response?.data; // Adjust based on your API response structure
      setCurrentPage(pagination?.currentPage);
      setTotalPages(pagination?.totalPages);
      setPerPage(pagination?.perPage);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setError("Failed to load contacts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  // Fetch contacts when currentPage changes
  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage, fetchContacts]);

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Format date for input fields
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Format time for input fields
  const formatTimeForInput = (timeString: string | null): string => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      return date.toTimeString().split(" ")[0].slice(0, 5); // HH:mm format
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  // Handle viewing a contact
  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  // Handle editing a contact
  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  // Update contact via API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateContact = async (updatedContactData: any) => {
    if (!selectedContact) return;

    try {
      const processedData = {
        status: updatedContactData.status,
        comment: updatedContactData.comments, // Map 'comments' to 'comment' for API
        followUpDate: updatedContactData.followUpDate || null,
        followUpTime: updatedContactData.followUpTime || null,
      };

      const response = await axios.put(
        `${API_URL}/contacts/${selectedContact.id}`,
        processedData
      );

      console.log(response)

      if (response.data.statusCode === 200) {
        setContactData((prevContacts) =>
          prevContacts.map((contact) =>
            contact.id === selectedContact.id ? response.data.data[0] : contact
          )
        );
        setIsEditModalOpen(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      setError("Failed to update contact. Please try again.");
    }
  };

  // Format field values for display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatFieldValue = (field: string, value: any): string => {
    if (!value) return "N/A";
    if (field === "createdAt" || field === "updatedAt") {
      return formatDate(value);
    }
    if (field === "followUpDate" && value) {
      return new Date(value).toLocaleDateString();
    }
    if (field === "followUpTime" && value) {
      return new Date(value).toLocaleTimeString();
    }
    return String(value);
  };

  // Define table columns
  const contactColumns: Column[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Service Type", accessorKey: "serviceType" },
    { header: "Status", accessorKey: "status" },
    {
      header: "Follow Up",
      accessorKey: "followUpDate",
      cell: ({ row }: { row: Contact }) =>
        row.followUpDate
          ? `${formatDate(row.followUpDate)} ${
              row.followUpTime ? formatTimeForInput(row.followUpTime) : ""
            }`
          : "N/A",
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }: { row: Contact }) => formatDate(row.createdAt),
    },
  ];

  // Define view form fields
  const contactViewFormFields: FormField[] = [
    { name: "name", label: "Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "serviceType", label: "Service Type", type: "text" },
    { name: "message", label: "Message", type: "textarea" },
    { name: "status", label: "Status", type: "text" },
    { name: "comment", label: "Comments", type: "textarea" },
    { name: "followUpDate", label: "Follow Up Date", type: "date" },
    { name: "followUpTime", label: "Follow Up Time", type: "text" },
    { name: "createdAt", label: "Created At", type: "text" },
  ];

  // Define edit form fields
  const contactEditFormFields: FormField[] = [
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "view", label: "View" },
        { value: "opened", label: "Opened" },
        { value: "replayed", label: "Replayed" },
        { value: "need follow up", label: "Need Follow Up" },
        { value: "follow up scheduled", label: "Follow Up Scheduled" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      name: "comments",
      label: "Comments",
      type: "textarea",
      required: false,
    },
    {
      name: "followUpDate",
      label: "Follow Up Date",
      type: "date",
      required: false,
    },
    {
      name: "followUpTime",
      label: "Follow Up Time",
      type: "time",
      required: false,
    },
  ];

  return (
    <DefaultLayout>
      <div>
        <ContactBreadcrumb pageName="Contact Management" />

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <TableThree
            columns={contactColumns}
            data={contactData}
            onViewClick={handleViewContact}
            onEditClick={handleEditContact}
            pagination={{
              currentPage,
              totalPages,
              totalItems: totalPages * perPage,
              perPage,
            }}
            onPageChange={handlePageChange}
          />
        )}

        {selectedContact && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            title={`Contact Details: ${selectedContact.name}`}
          >
            <div className="modal-content-details">
              {contactViewFormFields.map((field) => (
                <div
                  key={field.name}
                  className="modal-field-row"
                >
                  <span className="modal-field-label">
                    {field.label}:
                  </span>
                  <span className="modal-field-value">
                    {formatFieldValue(
                      field.name,
                      selectedContact[field.name as keyof Contact]
                    )}
                  </span>
                </div>
              ))}
            </div>
          </Modal>
        )}

        {selectedContact && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title={`Edit Contact: ${selectedContact.name}`}
          >
            <ReusableForm
              formType="contactEdit"
              fields={contactEditFormFields}
              initialValues={{
                status: selectedContact.status,
                comments: selectedContact.comment || "", // Default to empty string if null
                followUpDate: formatDateForInput(selectedContact.followUpDate),
                followUpTime: formatTimeForInput(selectedContact.followUpTime),
              }}
              onSubmit={handleUpdateContact}
              submitButtonText="Update Contact"
              conditionalFields={{
                followUp: {
                  condition: (formData) =>
                    formData.status === "follow up scheduled",
                  fields: ["followUpDate", "followUpTime"],
                },
              }}
            />
          </Modal>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ContactPage;