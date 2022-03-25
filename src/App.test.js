import Treeview from "./pages/Treeview";

var enzyme = require("enzyme");

var wrapper = enzyme.shallow(<Treeview />);

it("renders without crashing", () => {
  enzyme.shallow(<Treeview />);
});
