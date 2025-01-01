import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRegisterUserMutation,
  useLoginUserMutation,
} from "@/features/api/authApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Login = () => {
  console.log("Login page");
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  // const [flip, setFlip] = useState(false);
  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerSuccess,
    },
  ] = useRegisterUserMutation();
  // console.log(
  //   "r",
  //   registerData,
  //   "e",
  //   registerError,
  //   "L",
  //   registerIsLoading,
  //   "S",
  //   registerSuccess
  // );

  const [activeTab, setActiveTab] = useState("Login"); // State for active tab

  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginSuccess,
    },
  ] = useLoginUserMutation();

  const navigate = useNavigate();

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    // console.log(inputData);
    //Can send this input data to the server for further computations...

    const action = type === "signup" ? registerUser : loginUser;
    // console.log("action", action);
    await action(inputData);
    if (type === "signup") {
      //process k baad data hatane k liye...
      setSignupInput({ name: "", email: "", password: "" });
    } else if (type === "login") {
      setLoginInput({ email: "", password: "" });
    }
  };

  //gpt improved code   --Working correctly.......
  useEffect(() => {
    if (registerSuccess && registerData) {
      toast.success(registerData.message || "Signup successful.");
      setActiveTab("Login");
    } else if (registerError) {
      toast.error(registerError.data?.message || "Signup failed.");
    }
  }, [registerSuccess, registerError, registerData]);

  useEffect(() => {
    if (loginSuccess && loginData) {
      toast.success(loginData.message || "Login successful.");
      navigate("/"); //redirect to home page after login
    } else if (loginError) {
      toast.error(loginError.data?.message || "Login failed.");
    }
  }, [loginSuccess, loginError, loginData]);
  return (
    <div className="flex justify-center item-center w-full mt-20">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="Login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  required="true"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => {
                    changeInputHandler(e, "signup");
                  }}
                  placeholder="Eg. Srajan Dixit"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  required="true"
                  value={signupInput.email}
                  onChange={(e) => {
                    changeInputHandler(e, "signup");
                  }}
                  placeholder="example@gmail.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  required="true"
                  value={signupInput.password}
                  onChange={(e) => {
                    changeInputHandler(e, "signup");
                  }}
                  placeholder="password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => {
                  handleRegistration("signup");
                }}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="Login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login your password here. After signup, you will be login in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  required="true"
                  value={loginInput.email}
                  onChange={(e) => {
                    changeInputHandler(e, "login");
                  }}
                  placeholder="example@gmail.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  required="true"
                  value={loginInput.password}
                  onChange={(e) => {
                    changeInputHandler(e, "login");
                  }}
                  placeholder="password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => {
                  handleRegistration("login");
                }}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default Login;
