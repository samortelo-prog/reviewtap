import { createBusiness } from "@/actions/businesses";
import { BusinessForm } from "@/components/BusinessForm";

export default function NewBusinessPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nuevo negocio</h1>
      <BusinessForm action={createBusiness} submitLabel="Crear tarjeta NFC" />
    </div>
  );
}
