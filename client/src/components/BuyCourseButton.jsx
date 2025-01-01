import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const BuyCourseButton = ({ courseId }) => {
  const [
    createCheckoutSession,
    { data, isLoading, isSuccess, isError, error },
  ] = useCreateCheckoutSessionMutation();
  const purchaseCourseHandler = async () => {
    await createCheckoutSession(courseId);
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.url) {
        window.location.href = data.url; //redirect to stripe checkout page
      } else {
        toast.error("Invalid response from server");
      }
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to create check-out session");
    }
  }, [data, isSuccess, isError, error]);
  return (
    <div>
      <Button
        className="w-full"
        disabled={isLoading}
        onClick={purchaseCourseHandler}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
          </>
        ) : (
          "Purchase Course"
        )}
      </Button>
    </div>
  );
};

export default BuyCourseButton;
