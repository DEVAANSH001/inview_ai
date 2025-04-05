'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export default function UploadResumeDialog() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false); // <-- Manage dialog open state

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a resume file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userid', '1234'); // Replace with actual user ID

    try {
      setUploading(true);
      toast.info('Analyzing your resume, please wait...');

      const res = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Interview questions generated successfully!');
        console.log('Interview:', data.interview);
        setOpen(false); // close dialog on success
      } else {
        toast.error(data.error || 'Failed to analyze resume.');
      }
    } catch (error) {
      toast.error('Something went wrong while uploading.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="btn-primary max-sm:w-full">Your Resume</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Your Resume</DialogTitle>
          <DialogDescription>
            We'll extract key details from your resume and generate relevant interview questions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            ref={inputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full"
          />
          {file && <CheckCircle className="text-green-500 w-5 h-5" />}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button disabled={uploading} onClick={handleUpload}>
            {uploading ? 'Uploading...' : 'Upload & Generate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
