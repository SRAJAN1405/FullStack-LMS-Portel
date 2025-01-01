import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import BuyCourseButton from "@/components/BuyCourseButton";
import { useParams } from "react-router-dom";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const navigate = useNavigate();
  const courseId = params.courseId;
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);
  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to fetch course</h1>;
  const { course, purchased } = data;
  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  return (
    <h1 className="  space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p className="text-base md:text-lg ">{course?.subtitle}</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator.name}
            </span>
          </p>
          <div className="flex item-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last Updated {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Student enrolled:{course?.enrolledStudents?.length}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col  gap-28 lg:flex-row ">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: course?.description }}
          ></p>
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {course.lectures.length}{" "}
                {course.lectures.length === 1 ? "lecture" : "lectures"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span>
                    {lecture?.isPreviewFree ? (
                      <PlayCircle size={14} />
                    ) : (
                      <Lock size={14} />
                    )}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                <ReactPlayer
                  width="100%"
                  height={"100%"}
                  url={course.lectures[0].videoUrl}
                  controls={true}
                />
              </div>
              <h1>{course.lectures[0].lectureTitle}</h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold ">
                Price &#8377;{course.coursePrice}
              </h1>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </h1>
  );
};

export default CourseDetail;
