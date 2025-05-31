import { auth } from "@/auth";
import CardCreateProfile from "@/components/auth/create-profile/CardCreateProfile";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CreateProfilePage = async () => {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    
    return (
        <div className="flex justify-center items-center py-20">
            <CardCreateProfile userId={session.user.id!} name={session.user.name!} email={session.user.email!} />
        </div>
    );
};

export default CreateProfilePage;

