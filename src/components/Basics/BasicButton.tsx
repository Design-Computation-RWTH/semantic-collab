import React from "react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";

type BasicButtonProps = {
  title: string;
  onButtonClick: any;
};

export default function BasicButton({
  title,
  onButtonClick,
}: BasicButtonProps) {
  return (
    <Button
      className="btn-caia"
      variant="primary"
      onClick={() => onButtonClick()}
    >
      {title}
    </Button>
  );
}

BasicButton.propTypes = {
  title: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func,
};
