# WebGL Transformations
## Information

This is an assignment for **Computer Graphics and Fundamentals** course.

The goal of this project is; 
* Create 5 different shapes
* Apply transformations with the help of buttons
* Implement the four different light sources and interact with them
* Control brightness via range slider

More information is below;

* * *

### Shapes

There are 5 shapes in this page:
*   1\. Cube
*   2\. Pyramid
*   3\. Rectangular Prism
*   4\. OctaHedron
*   5\. Custom Shape (sandglass)


### Buttons

*   By pressing keys 1-5 you can **pause** and **unpause** the translation happening to each of these shapes individually.
*   You can control the **zoom** by pressing **W** and **S**. You rotate the camera around the scene using **A** and **D**. By pressing **Q** and **E** you can change the camera gaze.
*   You can switch between orthographic projection and perspective projection by press **O** and **P**.


### Motions

*   Shape 1: The cube is rotating randomly
*   Shape 2: The pyramid is having an unified scaling.
*   Shape 3: The rectangular prism is transforming horizontally from left to right and back.
*   Shape 4: The octahedron is translating among axes.
*   Shape 5: The custom shape (sandglass) is having an non-unified scaling only on x and y axes.

### Buttons

*   **F** : **Flat** Shading
*   **M** : **Smooth** Shading
*   **L** : Toggle **Left Light**. Left light is a red static light.
*   **R** : Toggle **Right Light**. Right light is a yellow static light.
*   **G** : Toggle **Moving Light**. Moving light is a white moving light with low specular value.
*   **H** : Toggle **Head Mounted Spotlight**. Head Mounted Spotlight is a green light which moves with the camera move. Camera movements can be found at the right side of the webpage. (W,A,S,D). To observe better, other lights can be turned off with lower brightness.


### Brightness

*   Brightness can be changed via slider. Left side values are **darker**, right side values are **brighter**.


### Different Material Objects

*   **Shiny Cube** : Blue cube with a shiny surface.
*   **Diffused Pyramid** : Red pyramid with a diffused surface
*   **Green Rectangular Prism** : Moving back and forth rectangular prism with slightly shiny surface
*   **Most Shiny OctaHedron** : OctaHedron is the most shiny object in the canvas with purple color.
*   **Custom Shape** : Custom shape's color is yellow and it's surface is the least diffused and specular among others. Therefore, it reflects light with the smallest amount.

* * *
_Common folder for matrix and vector calculations can be found [Dr. Edward Angel website](https://www.cs.unm.edu/~angel/BOOK/INTERACTIVE_COMPUTER_GRAPHICS/SEVENTH_EDITION/CODE/)._

