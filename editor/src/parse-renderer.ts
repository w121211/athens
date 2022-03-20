const transform = () => {
  // Transforms Instaparse output to Hiccup.
}

const parseAndRender = (string, uid) => {
  const ptN1 = performance.now(),
    result = stagedParser.ast(string),
    ptN2 = performance.now(),
    ptNTotal = ptN2 - ptN1

  if (failure(result)) {
    //
  } else {
    const vt1 = performance.now(),
      view = transform(result, uid),
      vt2 = performance.now(),
      vtTotal = vt2 - vt1
    return view
  }
}
