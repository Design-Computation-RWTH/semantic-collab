import Treeview from "./pages/Treeview";
import SetupView from "./pages/SetupsView";
import AddUserForm from "./components/Setup/AddUserForm";

var enzyme = require("enzyme");

var wrapper = enzyme.shallow(<Treeview />);

it("renders without crashing", () => {
  enzyme.shallow(<Treeview />);
});

it("renders Account header", () => {
  const wrapper = enzyme.shallow(<AddUserForm onHide={() => {}} show="true" />);
  const email_greeting =
    "The e-mail address of an existing user at the system.";
  expect(wrapper.contains(email_greeting)).toEqual(true);
});
