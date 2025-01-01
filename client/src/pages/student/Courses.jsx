import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";

const Courses = () => {
  const { data, isLoading, isError } = useGetPublishedCourseQuery();

  if (isError) return <h1>Failed to load courses</h1>;
  const courses = data?.courses;
  return (
    <div className="bg-gray-50 dark:bg-[#141414]">
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="font-bold text-3xl text-center mb-10">Our Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [1, 2, 3, 4, 5, 6, 7, 8].map((course, index) => (
                <CourseSkeleton key={index} course={course} />
              ))
            : courses &&
              courses.map((course, index) => (
                <Course key={index} course={course} />
              ))}
        </div>
      </div>
    </div>
  );
};
export const CourseSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow rounded-lg overflow-hidden">
      {/* Skeleton Image */}
      <div className="w-full h-36 bg-gray-200 dark:bg-gray-600"></div>

      {/* Skeleton Content */}
      <div className="px-5 py-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>

        {/* Profile and Price Skeleton */}
        <div className="flex items-center justify-between">
          {/* Profile Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          {/* Price Skeleton */}
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>

        {/* Additional Skeleton */}
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export default Courses;
