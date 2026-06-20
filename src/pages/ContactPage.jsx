import React, { useState } from "react";
import usePageTitle from "@/hooks/usePageTitle";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, Clock } from "lucide-react";
import pb from "@/lib/pocketbaseClient";
import { toast } from "sonner";
import PageHero from "@/components/PageHero";
import { useCMS } from "@/hooks/useCMS";



const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  usePageTitle({
    title: "Contact Us - Atlanta TV Mount PRO",
    description: "Contact Atlanta TV Mount PRO to book professional TV installation, wire concealment, drywall repair, and local handyman services. Fast response guaranteed.",
    keywords: "contact Atlanta TV Mount PRO, book TV mounting online, handyman quote Atlanta, TV mounting appointment"
  });

  const { data: cmsContact } = useCMS("contact");

  const contactInfo = {
    phone: cmsContact?.phone || "770-374-3203",
    serviceArea:
      cmsContact?.serviceArea || "Atlanta metro area and throughout Georgia",
    hours:
      cmsContact?.hours ||
      "Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: Closed",
    address: cmsContact?.address || "Atlanta, GA",
    mapEmbed:
      cmsContact?.mapEmbed ||
      "https://www.openstreetmap.org/export/embed.html?bbox=-84.4882%2C33.6490%2C-84.2882%2C33.8490&layer=mapnik&marker=33.7490%2C-84.3882",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await pb.collection("quote_inquiries").create(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service_type: "TV mounting",
          project_details: formData.message,
        },
        { $autoCancel: false },
      );

      toast.success("Message sent successfully");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Get In Touch"
        title={cmsContact?.heroTitle || "Contact Us"}
        subtitle={
          cmsContact?.heroSubtitle ||
          "Get in touch for a free quote or to schedule your service"
        }
        image={cmsContact?.heroImage || "/images/pages/page-contact.jpg"}
        alt="Atlanta cityscape"
      />

      <div className="py-20 bg-background">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="text-gray-900"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="text-gray-900"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        className="text-gray-900"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-message">Message</Label>
                      <Textarea
                        id="contact-message"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                        className="text-gray-900"
                        placeholder="Tell us about your project..."
                        rows={6}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Service area</h3>
                      <p className="text-muted-foreground">
                        {contactInfo.serviceArea}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Hours</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {contactInfo.hours}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-2xl overflow-hidden shadow-lg h-[300px]">
                <iframe
                  src={contactInfo.mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Atlanta location map"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
