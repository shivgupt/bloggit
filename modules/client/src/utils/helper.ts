export const getChildValue = (child) => {
  if (child.props.value) return child.props.value;
  return getChildValue(child.props.children[0]);
}
