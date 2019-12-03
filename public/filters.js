var filters = {
    "layerednet": "<filter id=\"layerednet\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\" filterUnits=\"objectBoundingBox\" primitiveUnits=\"userSpaceOnUse\" color-interpolation-filters=\"linearRGB\">\n" +
        "\t<feTurbulence type=\"turbulence\" baseFrequency=\"0.06 0.07\" numOctaves=\"1\" seed=\"4\" stitchTiles=\"stitch\" result=\"turbulence\"/>\n" +
        "\t<feColorMatrix type=\"matrix\" values=\"0 0 0 0 0\n" +
        "0 0 0 0 0\n" +
        "0 0 0 0 0\n" +
        "0 0 0 -70 10\" in=\"turbulence\" result=\"colormatrix\"/>\n" +
        "\t<feOffset dx=\"22\" dy=\"4\" in=\"colormatrix\" result=\"offset\"/>\n" +
        "\t<feComposite in=\"offset\" in2=\"colormatrix\" operator=\"xor\" result=\"composite\"/>\n" +
        "\t<feComposite in=\"composite\" in2=\"SourceAlpha\" operator=\"in\" result=\"composite1\"/>\n" +
        "</filter>",
    "dust": "<filter id=\"dust\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\" filterUnits=\"objectBoundingBox\" primitiveUnits=\"userSpaceOnUse\" color-interpolation-filters=\"linearRGB\">\n" +
        "\t<feTurbulence type=\"turbulence\" baseFrequency=\"0.8 0.8\" numOctaves=\"4\" seed=\"4\" stitchTiles=\"stitch\" result=\"turbulence\"/>\n" +
        "\t<feColorMatrix type=\"matrix\" values=\"0 0 0 0 0\n" +
        "0 0 0 0 0\n" +
        "0 0 0 0 0\n" +
        "0 0 0 -40 10\" in=\"turbulence\" result=\"colormatrix\"/>\n" +
        "\t<feComposite in=\"colormatrix\" in2=\"SourceAlpha\" operator=\"in\" result=\"composite\"/>\n" +
        "\t<feTurbulence type=\"turbulence\" baseFrequency=\"0.1 0.1\" numOctaves=\"1\" seed=\"2\" stitchTiles=\"stitch\" result=\"turbulence1\"/>\n" +
        "\t<feDisplacementMap in=\"composite\" in2=\"turbulence1\" scale=\"20\" xChannelSelector=\"R\" yChannelSelector=\"B\" result=\"displacementMap\"/>\n" +
        "</filter>",
    "smoke": "<filter id=\"smoke\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\" filterUnits=\"objectBoundingBox\" primitiveUnits=\"userSpaceOnUse\" color-interpolation-filters=\"linearRGB\">\n" +
        "\t<feTurbulence type=\"turbulence\" baseFrequency=\"0.013 0.01\" numOctaves=\"2\" seed=\"1\" stitchTiles=\"stitch\" result=\"turbulence\"/>\n" +
        "\t<feFlood flood-color=\"#38252f\" flood-opacity=\"1\" result=\"flood\"/>\n" +
        "\t<feComposite in=\"flood\" in2=\"turbulence\" operator=\"in\" result=\"composite1\"/>\n" +
        "\t<feComposite in=\"composite1\" in2=\"SourceAlpha\" operator=\"in\" result=\"composite2\"/>\n" +
        "</filter>",
    "shrooms": "<filter id=\"shrooms\" x=\"-20%\" y=\"-20%\" width=\"140%\" height=\"140%\" filterUnits=\"objectBoundingBox\" primitiveUnits=\"userSpaceOnUse\" color-interpolation-filters=\"linearRGB\">\n" +
        "\t<feTurbulence type=\"fractalNoise\" baseFrequency=\"0.035 0.008\" numOctaves=\"1\" seed=\"2\" stitchTiles=\"stitch\" result=\"turbulence\"/>\n" +
        "\t<feTurbulence type=\"fractalNoise\" baseFrequency=\"0.035 0.012\" numOctaves=\"1\" seed=\"1\" stitchTiles=\"stitch\" result=\"turbulence1\"/>\n" +
        "\t<feMerge result=\"merge\">\n" +
        "    \t\t<feMergeNode in=\"turbulence1\" result=\"mergeNode\"/>\n" +
        "\t\t<feMergeNode in=\"turbulence\" result=\"mergeNode1\"/>\n" +
        "  \t</feMerge>\n" +
        "\t<feColorMatrix type=\"saturate\" values=\"10\" in=\"merge\" result=\"colormatrix\"/>\n" +
        "\t<feColorMatrix type=\"matrix\" values=\"1 0 0 0 0\n" +
        "0 1 0 0 0\n" +
        "0 0 1 0 0\n" +
        "0 0 0 10 0\" in=\"colormatrix\" result=\"colormatrix1\"/>\n" +
        "\t<feDisplacementMap in=\"colormatrix1\" in2=\"colormatrix\" scale=\"40\" xChannelSelector=\"R\" yChannelSelector=\"G\" result=\"displacementMap\"/>\n" +
        "\t<feComposite in=\"displacementMap\" in2=\"SourceAlpha\" operator=\"in\" result=\"composite1\"/>\n" +
        "</filter>",
    "roughpaper": "<filter id='roughpaper' x='0%' y='0%' width='100%' height=\"100%\">\n" +
        "<feTurbulence type=\"noise\" baseFrequency='0.1' result='noise' numOctaves=\"1\" />\n" +
        "        <feDiffuseLighting in='noise' lighting-color='white' surfaceScale='2'>\n" +
        "            <feDistantLight azimuth='45' elevation='60' />\n" +
        "</feDiffuseLighting>\n" +
        "</filter>"
};

window.filters = filters;
