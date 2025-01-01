import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  useCreateLectureMutation,
  useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Lecture from "./Lecture.jsx";

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const location = useLocation();
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();

  const [createLecture, { data, isSuccess, isLoading, error }] =
    useCreateLectureMutation();

  const {
    data: lectureData,
    isLoading: lectureLoading,
    isError: lectureError,
    refetch,
  } = useGetCourseLectureQuery({ courseId });

  useEffect(() => {
    refetch();
    console.log("refetch");
  }, [location]);

  useEffect(() => {
    if (isSuccess) {
      refetch(); //to do work on refetch
      toast.success(data.message || "Lecture created successfully.");
      setLectureTitle("");
    }
    if (error) {
      toast.error(error.data.message || "Failed to create lecture.");
    }
  }, [isSuccess, error]);
  const createLectureHandler = async () => {
    await createLecture({ lectureTitle, courseId });
  };
  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Let's add lectures, add some basic details for your new lecture..
        </h1>
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officia, ex!
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            type="text"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            placeholder="Your title Name"
          ></Input>
        </div>
        <div className="flex items-center  gap-2 mt-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
          >
            Back to course
          </Button>
          <Button disabled={isLoading} onClick={createLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Please wait..
              </>
            ) : (
              "Create Lecture"
            )}
          </Button>
        </div>
        <div className="mt-10">
          {lectureLoading ? (
            <p>Loading lecture...</p>
          ) : lectureError ? (
            <p>Failed to load lecture</p>
          ) : lectureData.lectures.length === 0 ? (
            <p>No lectures available</p>
          ) : (
            lectureData.lectures.map((lecture, index) => (
              <Lecture
                key={lecture._id}
                lecture={lecture}
                courseId={courseId}
                index={index}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateLecture;
