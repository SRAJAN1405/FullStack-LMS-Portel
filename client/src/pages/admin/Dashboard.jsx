import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";
import { useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { data, isError, isLoading, refetch } = useGetPurchasedCoursesQuery();

  useEffect(() => {
    refetch();
  }, []);
  // Set  colors for light and dark themes
  const setThemeColors = (theme) => {
    if (theme === "dark") {
      document.documentElement.style.setProperty("--tooltip-bg", "#1f2937");
      document.documentElement.style.setProperty("--tooltip-border", "#374151");
      document.documentElement.style.setProperty("--tooltip-text", "#f9fafb");
      document.documentElement.style.setProperty("--tooltip-label", "#f3f4f6");
    } else {
      document.documentElement.style.setProperty("--tooltip-bg", "#ffffff");
      document.documentElement.style.setProperty("--tooltip-border", "#e5e7eb");
      document.documentElement.style.setProperty("--tooltip-text", "#111827");
      document.documentElement.style.setProperty("--tooltip-label", "#1f2937");
    }
  };

  useEffect(() => {
    const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setThemeColors(theme);

    // Add a listener to handle system theme changes
    const listener = (e) => {
      setThemeColors(e.matches ? "dark" : "light");
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", listener);

    // Cleanup the listener
    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", listener);
    };
  }, []);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError)
    return <h1 className="text-red-500">Failed to get purchased course</h1>;

  //
  const { purchaseCourse } = data || [];

  const courseData = purchaseCourse.map((course) => ({
    name: course.courseId.courseTitle,
    price: course.courseId.coursePrice,
  }));

  const totalRevenue = purchaseCourse.reduce(
    (acc, element) => acc + (element.amount || 0),
    0
  );

  const totalSales = purchaseCourse.length;
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalSales}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalRevenue}</p>
        </CardContent>
      </Card>

      {/* Course Prices Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Course Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={courseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                angle={-30} // Rotated labels for better visibility
                textAnchor="end"
                interval={0} // Display all labels
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value, name) => [`₹${value}`, name]}
                contentStyle={{
                  backgroundColor: "var(--tooltip-bg)", // Background color
                  borderColor: "var(--tooltip-border)", // Border color
                  color: "var(--tooltip-text)", // Text color
                }}
                labelStyle={{
                  color: "var(--tooltip-label)", // Label color
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#4a90e2" // Changed color to a different shade of blue
                strokeWidth={3}
                dot={{ stroke: "#4a90e2", strokeWidth: 2 }} // Same color for the dot
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
