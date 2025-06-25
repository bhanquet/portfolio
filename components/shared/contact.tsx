import Button from "../ui/button";
import Input from "../ui/form/input";
import Textarea from "../ui/form/textarea";

export default function Contact() {
  return (
    <div id="contact" className="bg-background2 p-4 lg:p-14">
      <div className="bg-white max-w-3xl mx-auto rounded-md shadow-lg p-4 lg:p-10">
        <h3 className="text-4xl mb-6">Contact</h3>
        <p>
          You can contact me at{" "}
          <a
            className="text-strongcolor"
            href={`mailto:${process.env.MAIL_CONTACT}`}
          >
            {process.env.MAIL_CONTACT}
          </a>
        </p>
        <form>
          <div className="grid grid-cols-2 gap-4">
            <Input type="text" placeholder="Firstname" />
            <Input type="text" placeholder="Lastname" />
            <Input className="col-span-2" type="email" placeholder="Email" />
            <Textarea className="col-span-2" placeholder="Message" />
          </div>
          <div className="mt-4">
            <Button>Send</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
