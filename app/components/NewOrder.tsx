import { useForm } from "react-hook-form";

const NewOrder = () => {
  // Create a form using react-hook-form that will ask for the following:
  // 1. Your name
  // 2. Your email
  // 3. Max order size
  // 4. When are you leaving?

  // When the form is submitted, it should call the createOrder function

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  return <div>Form</div>;
};

export default NewOrder;
