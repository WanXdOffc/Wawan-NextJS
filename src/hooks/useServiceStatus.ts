import { useState, useEffect } from "react";

interface ServiceStatus {
  musicPlayer: boolean;
  library: boolean;
  aiImage: boolean;
  tempMail: boolean;
  uploader: boolean;
}

export function useServiceStatus() {
  const [services, setServices] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (data.success) {
          setServices(data.services);
        }
      } catch {
        setServices({
          musicPlayer: true,
          library: true,
          aiImage: true,
          tempMail: true,
          uploader: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading };
}
