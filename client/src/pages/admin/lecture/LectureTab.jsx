import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Input from "./../../../components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import {
  useEditLectureMutation,
  useGetLectureByIdQuery,
  useRemoveLectureMutation,
} from "@/features/api/courseApi";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MEDIA_API =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080/api/v1/media"
    : "/api/v1/media";

const LectureTab = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [lectureTitle, setLectureTitle] = useState("");

  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);

  const [isFree, setIsFree] = useState(false); //switch free hai ya nhi...

  const [mediaProgress, setMediaProgress] = useState(false); //media progress...

  const [uploadProgress, setUploadProgress] = useState(0); //kitna percent upload hua hai..

  const [btnDisable, setBtnDisable] = useState(false); //video upload hone pr disable nhi hoga

  const [editLecture, { data, isLoading, isSuccess, error }] =
    useEditLectureMutation();

  const { courseId, lectureId } = params;

  const { data: lectureData, refetch } = useGetLectureByIdQuery({ lectureId });
  const lecture = lectureData?.lecture;

  useEffect(() => {
    // console.log(lecture);
    if (lecture) {
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      setUploadVideoInfo({
        videoUrl: lecture.videoUrl,
        publicId: lecture.publicId,
      });
      refetch();
    }
  }, [lecture]);

  const [
    removeLecture,
    { data: removeData, isLoading: removeLoading, isSuccess: removeSuccess },
  ] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0]; //ye handler padhna phir se
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          console.log(res);
          setUploadVideoInfo({
            videoUrl: res.data.data.url,
            publicId: res.data.data.public_id,
          });
          setBtnDisable(false);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };
  const editLectureHandler = async () => {
    await editLecture({
      lectureTitle,
      videoInfo: uploadVideoInfo,
      courseId,
      lectureId,
      isPreviewFree: isFree,
    });
  };
  const removeLectureHandler = async () => {
    await removeLecture({ lectureId });
  };
  const switchHandler = (checked) => {
    // console.log(isFree);
    setIsFree(checked);
  };
  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message || "Lecture updated successfully.");
    }
    if (error) {
      toast.error(error.data.message || "Failed to update lecture.");
    }
  }, [isSuccess, error]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success(removeData.message || "Lecture removed successfully.");
      navigate(`/admin/course/${courseId}/lecture`);
    }
  }, [removeSuccess]);

  // if (lectureLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={removeLoading}
            onClick={removeLectureHandler}
            variant="destructive"
          >
            {removeLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait..
              </>
            ) : (
              "Remove Lecture"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title </Label>
          <Input
            type="text"
            placeholder="Ex. Introduction to Javascript"
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
          />
        </div>
        {/* Display video player */}
        {uploadVideoInfo?.videoUrl && (
          <div className="my-5">
            <Label>Uploaded Video</Label>
            <video
              controls
              src={uploadVideoInfo.videoUrl}
              className="w-full max-w-lg h-64 w-auto rounded-md border"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="EX. Introduction to Javascript"
            className="w-fit"
          />
        </div>

        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}
        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isFree} onCheckedChange={switchHandler} />
          <Label htmlFor="airplane-mode">Is this video FREE </Label>
        </div>
        <div className="mt-4">
          <Button disabled={isLoading} onClick={editLectureHandler}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait..
              </>
            ) : (
              "Update Lecture"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
