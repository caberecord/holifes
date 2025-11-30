import { CreateOrganizationForm } from "@/features/organizations/components";

export default function NewOrganizationPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <CreateOrganizationForm />
        </div>
    );
}
