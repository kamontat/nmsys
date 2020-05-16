import { checkingPageView } from "../../../models/parameters/PageView";

describe("PageView", () => {
  test.each`
    data    | result
    ${"fa"} | ${false}
    ${"ba"} | ${false}
    ${"dw"} | ${false}
    ${"we"} | ${false}
    ${"cd"} | ${false}
  `("checking invalid $data", ({ data, result }) => {
    const res = checkingPageView(data);
    expect(res).toEqual(result);
  });

  test.each`
    data    | result
    ${"dh"} | ${true}
    ${"dt"} | ${true}
    ${"dp"} | ${true}
  `("checking valid $result", ({ data, result }) => {
    const res = checkingPageView(data);
    expect(res).toEqual(result);
  });
});