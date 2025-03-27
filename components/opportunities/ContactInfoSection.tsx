import React, { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Opportunity } from "../../context/types";
import { Edit } from "lucide-react";

interface ContactInfoSectionProps {
  opportunity: Opportunity;
  // Updated to accept string | number for id
  updateOpportunity: (
    id: string | number,
    updates: Partial<Opportunity>
  ) => void;
  isDarkMode: boolean;
}

export const ContactInfoSection = ({
  opportunity,
  updateOpportunity,
  isDarkMode,
}: ContactInfoSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContact, setEditedContact] = useState({
    recruiterName: opportunity.recruiterName || "",
    recruiterEmail: opportunity.recruiterEmail || "",
    recruiterPhone: opportunity.recruiterPhone || "",
  });

  return (
    <div
      className={`p-4 mb-4 rounded-lg border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3
          className={`font-medium ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Contact Information
        </h3>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditedContact({
                recruiterName: opportunity.recruiterName || "",
                recruiterEmail: opportunity.recruiterEmail || "",
                recruiterPhone: opportunity.recruiterPhone || "",
              });
              setIsEditing(true);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => {
                updateOpportunity(opportunity.id, editedContact);
                setIsEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="recruiterName">Contact Name</Label>
            <Input
              id="recruiterName"
              value={editedContact.recruiterName}
              onChange={(e) =>
                setEditedContact({
                  ...editedContact,
                  recruiterName: e.target.value,
                })
              }
              placeholder="e.g., John Smith"
            />
          </div>
          <div>
            <Label htmlFor="recruiterEmail">Contact Email</Label>
            <Input
              id="recruiterEmail"
              value={editedContact.recruiterEmail}
              onChange={(e) =>
                setEditedContact({
                  ...editedContact,
                  recruiterEmail: e.target.value,
                })
              }
              placeholder="e.g., john.smith@company.com"
            />
          </div>
          <div>
            <Label htmlFor="recruiterPhone">Contact Phone</Label>
            <Input
              id="recruiterPhone"
              value={editedContact.recruiterPhone}
              onChange={(e) =>
                setEditedContact({
                  ...editedContact,
                  recruiterPhone: e.target.value,
                })
              }
              placeholder="e.g., (123) 456-7890"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {opportunity.recruiterName &&
            opportunity.recruiterName.trim() !== "" && (
              <div>
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Contact Name
                </span>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  {opportunity.recruiterName}
                </p>
              </div>
            )}
          {opportunity.recruiterEmail &&
            opportunity.recruiterEmail.trim() !== "" && (
              <div>
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Contact Email
                </span>
                <p>
                  <a
                    href={`mailto:${opportunity.recruiterEmail}`}
                    className="text-blue-600 hover:underline"
                  >
                    {opportunity.recruiterEmail}
                  </a>
                </p>
              </div>
            )}
          {opportunity.recruiterPhone &&
            opportunity.recruiterPhone.trim() !== "" && (
              <div>
                <span
                  className={`text-xs ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Contact Phone
                </span>
                <p>
                  <a
                    href={`tel:${opportunity.recruiterPhone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {opportunity.recruiterPhone}
                  </a>
                </p>
              </div>
            )}
          {(!opportunity.recruiterName ||
            opportunity.recruiterName.trim() === "") &&
            (!opportunity.recruiterEmail ||
              opportunity.recruiterEmail.trim() === "") &&
            (!opportunity.recruiterPhone ||
              opportunity.recruiterPhone.trim() === "") && (
              <p
                className={`text-sm italic ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No contact information added yet
              </p>
            )}
        </div>
      )}
    </div>
  );
};
