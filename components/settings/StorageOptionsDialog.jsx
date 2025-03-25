"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const StorageOptionsDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Data Storage Options</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Hey You're Hired! offers two ways to store your job application
            data:
          </p>
          <div className="space-y-3">
            <div className="p-3 border rounded-md">
              <h3 className="font-medium">Cloud Storage (Default)</h3>
              <p className="text-sm text-gray-600">
                Your data is securely stored on our servers and available on any
                device when you log in.
              </p>
              <div className="text-sm text-green-600 mt-1">
                ✓ Access from anywhere
                <br />
                ✓ Data backup
                <br />✓ Device synchronization
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <h3 className="font-medium">Local Storage Only</h3>
              <p className="text-sm text-gray-600">
                Your data stays only on this device and is never sent to our
                servers.
              </p>
              <div className="text-sm text-blue-600 mt-1">
                ✓ Enhanced privacy
                <br />
                ✓ Works offline
                <br />✓ No server storage
              </div>
            </div>
          </div>
          <p className="text-sm">
            You can change this setting anytime in the Privacy Settings section.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StorageOptionsDialog;
