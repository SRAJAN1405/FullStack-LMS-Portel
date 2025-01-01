import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCoursesQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CourseTable = () => {
  const location = useLocation();
  const { data, isLoading, refetch } = useGetCreatorCoursesQuery();
  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [location]);
  if (isLoading) return <h1>Loading...</h1>;

  // console.log("data", data);
  const onClickHandler = () => {
    navigate("create");
  };
  return (
    <div>
      <Button onClick={onClickHandler}>Create a new course</Button>
      <Table>
        <TableCaption>A list of your recent courses</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.courses.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="font-medium">
                {course?.coursePrice || "NA"} {console.log("course", course)}
              </TableCell>
              <TableCell>
                <Badge>{course.isPublished ? "Publised" : "Draft"}</Badge>
              </TableCell>
              <TableCell>{course.courseTitle}</TableCell>
              <TableCell className="text-right">
                <Button
                  className="sm"
                  variant="ghost"
                  onClick={() => {
                    navigate(`${course._id}`);
                    {
                      /* ye course id aage bhut kaam ayegi.. */
                    }
                  }}
                >
                  <Edit />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter></TableFooter>
      </Table>
    </div>
  );
};

export default CourseTable;
