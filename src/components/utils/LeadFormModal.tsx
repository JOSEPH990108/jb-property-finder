"use client";

import { useState } from "react";
import { format } from "date-fns";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import DateSelector from "../datetime/DatePicker";
import ClassicTimePicker from "../datetime/TimePicker";
import { validateMobileByCountry } from "@/lib/utils";
import { X } from "lucide-react";
import SearchableDropdown from "../ui/customize/SearchableDropdown";
import { useLeadFormStore } from "@/stores/leadFormStore";
import PhoneInputSection from "../form/PhoneInputSection";

const leadFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(5, "Phone is required"),
    countryCode: z.enum(["+60", "+65", "+66"]),
    countryIso: z.enum(["MY", "SG", "TH"]),
    interest: z.enum(["details", "appointment"]),
    selectedProject: z.string().nullable().optional(),
    date: z.date().nullable().optional(),
  })
  .refine(
    (data) =>
      validateMobileByCountry(data.phone, data.countryCode, data.countryIso)
        .isValid,
    {
      message: "Invalid phone number format",
      path: ["phone"],
    }
  )
  .refine(
    (data) => {
      if (data.interest === "appointment") {
        return data.selectedProject && typeof data.selectedProject === "string";
      }
      return true;
    },
    {
      message: "Please select a project",
      path: ["selectedProject"],
    }
  )
  .refine(
    (data) => {
      if (data.interest === "appointment") {
        return data.date instanceof Date && !isNaN(data.date.getTime());
      }
      return true;
    },
    {
      message: "Please select a date",
      path: ["date"],
    }
  );

const generateMessage = ({
  selectedProjectName,
  date,
  hour,
  minute,
  ampm,
}: {
  selectedProjectName: string;
  date?: Date;
  hour: string;
  minute: string;
  ampm: string;
}) => {
  if (!selectedProjectName || !date) return "";
  const formattedDate = format(date, "d MMMM yyyy");
  return `I would like to book an appointment for ${selectedProjectName} showroom on ${formattedDate}, ${hour}:${minute} ${ampm}`;
};

export default function LeadFormModal() {
  const { open, projectName, closeForm } = useLeadFormStore();
  const [interest, setInterest] = useState("");
  const [date, setDate] = useState<Date>();
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");
  const [countryCode, setCountryCode] = useState("+60");
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<"name" | "email" | "phone" | "selectedProject" | "date", string>
    >
  >({});
  const [message, setMessage] = useState("");
  const [hasEditedMessage, setHasEditedMessage] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(
    projectName || null
  );

  const appointmentTime = `${hour}:${minute} ${ampm}`;
  const countryMap = { "+60": "MY", "+65": "SG", "+66": "TH" } as const;
  const countryIso = countryMap[countryCode as keyof typeof countryMap];

  const projectOptions = [
    { name: "Eco Spring", value: "eco-spring" },
    { name: "Setia Tropika", value: "setia-tropika" },
    { name: "Horizon Hills", value: "horizon-hills" },
  ];

  const validateField = <T extends keyof z.infer<typeof leadFormSchema>>(
    fieldName: T,
    value: z.infer<typeof leadFormSchema>[T]
  ) => {
    const result = leadFormSchema.safeParse({
      ...formValues,
      phone: formValues.phone,
      countryCode,
      countryIso,
      interest,
      selectedProject,
      date,
      [fieldName]: value,
    });
    const error = result.success
      ? undefined
      : result.error.flatten().fieldErrors[fieldName]?.[0];
    setFormErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const resetForm = () => {
    setInterest("");
    setDate(undefined);
    setHour("08");
    setMinute("00");
    setAmpm("AM");
    setFormValues({ name: "", email: "", phone: "" });
    setFormErrors({});
    setMessage("");
    setHasEditedMessage(false);
    setSelectedProject(projectName || null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeForm();
      resetForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shouldStripLeadingZero = ["+60", "+66", "+44"].includes(countryCode);
    const sanitizedPhone =
      shouldStripLeadingZero && formValues.phone.startsWith("0")
        ? formValues.phone.slice(1)
        : formValues.phone;

    const result = leadFormSchema.safeParse({
      ...formValues,
      phone: sanitizedPhone,
      countryCode,
      countryIso,
      interest,
      selectedProject,
      date,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFormErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        phone: errors.phone?.[0],
        selectedProject: errors.selectedProject?.[0],
        date: errors.date?.[0],
      });
      return;
    }

    if (!hasEditedMessage && interest === "appointment") {
      const selectedProjectName =
        projectOptions.find((p) => p.value === selectedProject)?.name || "";
      setMessage(
        generateMessage({ selectedProjectName, date, hour, minute, ampm })
      );
    }

    const payload = {
      ...result.data,
      phone: `${countryCode}${sanitizedPhone}`,
      time: interest === "appointment" ? appointmentTime : null,
      message,
    };

    console.log("Submit payload:", payload);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-zinc-900 p-6 rounded-xl w-full max-w-md shadow-xl relative"
            >
              <button
                onClick={() => handleOpenChange(false)}
                className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4">Want to Know More?</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {(["name", "email"] as const).map((field) => (
                  <div key={field}>
                    <Input
                      placeholder={
                        field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      value={formValues[field]}
                      onChange={(e) => {
                        setFormValues((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }));
                        validateField(field, e.target.value);
                      }}
                    />
                    <AnimatePresence>
                      {formErrors[field] && (
                        <motion.p
                          className="text-sm text-red-500"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          {formErrors[field]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Country Code & Phone */}
                <PhoneInputSection
                  phone={formValues.phone}
                  onPhoneChange={(val) => {
                    setFormValues((prev) => ({ ...prev, phone: val }));
                    validateField("phone", val);
                  }}
                  countryCode={countryCode}
                  onCountryCodeChange={(val) => setCountryCode(val)}
                  error={formErrors.phone}
                />

                {/* Interest + Project */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-1/2">
                    <Select value={interest} onValueChange={setInterest}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="details">More Details</SelectItem>
                        <SelectItem value="appointment">
                          Showroom Appointment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {interest === "appointment" && (
                    <div className="w-full sm:w-1/2 flex flex-col">
                      <SearchableDropdown
                        options={projectOptions.map((p) => ({
                          label: p.name,
                          value: p.value,
                        }))}
                        value={selectedProject}
                        onChange={(val) => {
                          setSelectedProject(val);
                          validateField("selectedProject", val);
                          if (!hasEditedMessage) {
                            const projectName =
                              projectOptions.find((p) => p.value === val)
                                ?.name || "";
                            setMessage(
                              generateMessage({
                                selectedProjectName: projectName,
                                date,
                                hour,
                                minute,
                                ampm,
                              })
                            );
                          }
                        }}
                        placeholder="Select Project"
                      />
                      <AnimatePresence>
                        {formErrors.selectedProject && (
                          <motion.p
                            className="text-sm text-red-500 mt-1"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {formErrors.selectedProject}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Appointment Date & Time */}
                {interest === "appointment" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                        Appointment Date
                      </label>
                      <DateSelector
                        date={date}
                        setDate={(d) => {
                          setDate(d);
                          validateField("date", d);
                          if (!hasEditedMessage) {
                            const projectName =
                              projectOptions.find(
                                (p) => p.value === selectedProject
                              )?.name || "";
                            setMessage(
                              generateMessage({
                                selectedProjectName: projectName,
                                date: d,
                                hour,
                                minute,
                                ampm,
                              })
                            );
                          }
                        }}
                        disablePast
                        maxFutureDays={182}
                      />
                      <AnimatePresence>
                        {formErrors.date && (
                          <motion.p
                            className="text-sm text-red-500"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            {formErrors.date}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      Appointment Time
                    </label>
                    <div className="bg-muted p-4 rounded-md shadow">
                      <ClassicTimePicker
                        hour={hour}
                        setHour={setHour}
                        minute={minute}
                        setMinute={setMinute}
                        ampm={ampm}
                        setAmpm={setAmpm}
                      />
                    </div>
                  </>
                )}

                {/* Message */}
                <textarea
                  placeholder="Additional notes (optional)"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setHasEditedMessage(true);
                  }}
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none min-h-[80px]"
                />

                <Button type="submit" className="w-full">
                  Submit
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
