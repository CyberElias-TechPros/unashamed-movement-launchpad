import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EventRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  onSubmit: (data: { name: string; email: string }) => Promise<void>;
}

export const EventRegistrationModal = ({
  open,
  onOpenChange,
  eventTitle,
  onSubmit,
}: EventRegistrationModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, email });
      setName("");
      setEmail("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading tracking-wider">Register for {eventTitle}</DialogTitle>
          <DialogDescription>Enter your details and we will send event information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reg-name">Full name</Label>
            <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Registration"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
