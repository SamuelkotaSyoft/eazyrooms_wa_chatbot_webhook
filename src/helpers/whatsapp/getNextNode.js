const getNextNode = async ({ currentNodeId, message, nodes, edges }) => {
  let nodeToSend = null;
  /**
   * If currentnode is empty getting the node linked to start node.
   */
  if (!currentNodeId) {
    return nodes.filter(
      (node) =>
        node.id ===
        edges.filter((edge) => edge.source === nodes[0].id)[0]?.target
    )[0];
  }

  /**
   * If the message reply is a button_reply then based on the link of button replies
   * getting the next node
   * else getting the nextnode based on edges linked.
   */
  if (message?.interactive?.type === "button_reply") {
    const selectedOption = message?.interactive?.button_reply?.title;
    let selectedChildNode = nodes?.filter(
      (node) =>
        node?.type === "replyButtonsChildNode" &&
        node?.data?.values?.buttonLabel === selectedOption
    )[0];
    nodeToSend = nodes?.filter(
      (node) =>
        edges?.filter((edge) => edge?.source === selectedChildNode?.id)[0]
          ?.target === node.id
    )[0];
  } else {
    let filteredEdges = edges.filter((edge) => edge.source === currentNodeId);
    let filteredNodes = nodes.filter(
      (node) => node.id === filteredEdges[0]?.target
    );
    nodeToSend = filteredNodes[0];
  }

  /**
   * returing the node.
   */
  return nodeToSend;
};

module.exports = getNextNode;
