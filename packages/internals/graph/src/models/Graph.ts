import graphviz from "graphviz";
import { Node } from "./Node";
import { Dependencies } from "./dependencies/Dependencies";

export class Graph {
  private graph: graphviz.Graph;

  constructor(id: string) {
    this.graph = graphviz.digraph(id);

    this.graph.set("splines", "ortho");
    this.graph.set("ratio", "expand");
    this.graph.set("center", "1");
    this.graph.set("size", "10");

    this.graph.setNodeAttribut("fontsize", "12");
    this.graph.setNodeAttribut("shape", "component");
    this.graph.setNodeAttribut("margin", "0.22,0.22");
  }

  visualize(ds: Dependencies) {
    ds.loop((d) => {
      const node = new Node(this.graph, d);
      node.build();
    });
  }

  toString() {
    return this.graph.to_dot();
  }

  toPDF(filepath: string) {
    console.log(`exporting to ${filepath}`);
    this.graph.render("pdf", `${filepath}/graph.pdf`);
  }

  toPNG(filepath: string) {
    console.log(`exporting to ${filepath}`);
    this.graph.render("png:cairo:gd", `${filepath}/graph.png`);
  }
}
