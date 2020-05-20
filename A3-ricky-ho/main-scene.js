window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
class Assignment_Three_Scene extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
                         // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                         sphere1: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 1 ),
                         sphere2: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )( 2 ),
                         sphere3: new Subdivision_Sphere( 3 ),
                         sphere4: new Subdivision_Sphere( 4 ),
                       }

        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),
            // TODO:  Fill in as many additional material objects as needed in this key/value table.
            sun:      context.get_instance( Phong_Shader ).material( Color.of( 0, 0, 1, 1 ), { ambient:1 } ),
            p1:       context.get_instance( Phong_Shader ).material( Color.of( 0.5, 0.5, 0.8, 1 ), { specularity:0 }),
            p2:       context.get_instance( Phong_Shader ).material( Color.of( 0.5, 0.8, 0.3, 1 ), { diffusivity:0.2 }),
            p3:       context.get_instance( Phong_Shader ).material( Color.of( 0.75, 0.575, 0.445, 1 )),
            p4:       context.get_instance( Phong_Shader ).material( Color.of( 0.68, 0.85, 0.90, 1 ), { specularity:0.8 }),
            moon:     context.get_instance( Phong_Shader ).material( Color.of( 1, 1, 1, 1 ), { diffusivity:0.5, specularity:0 })

          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];

      }

    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }

    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)

        // ==== CAMERA ==== //
        if (this.attached != undefined)
        {
          let desired = this.attached().times(Mat4.translation([0,0,5]));
          desired = Mat4.inverse(desired);
          desired = desired.map((x,i) => Vec.from( graphics_state.camera_transform[i]).mix(x, 0.1));  // Extra Credit (Part 1)
          graphics_state.camera_transform = desired;
        }

        
        // ==== SUN IMPLEMENTATION ==== //
        let sun_transform = Mat4.identity();
        let s = 2 + Math.sin( (Math.PI * 2/5)*t - (Math.PI/2) );  // Radius of 1 to 3 ==> a + b*sin(t) ==> a = 2, b = +-1
                                                                  // Period of 5 ==> sin( Math.PI * 2/5 * t )
                                                                  // Shifted pi/2 s.t. t = 0,5,10,... corresponds to radius of 1
        let r_intensity = 0.5 + 0.5 * Math.sin( (Math.PI * 2/5)*t - (Math.PI/2) );    // Red and blue intensity values varying between 0 and 1
        sun_transform = sun_transform.times(Mat4.scale([s,s,s]));
        this.shapes.sphere4.draw( graphics_state, sun_transform, this.materials.sun.override({color: Color.of( r_intensity, 0, 1-r_intensity, 1 )}) );


        // ==== LIGHT SOURCE ==== //
        this.lights = [ new Light( Vec.of(0,0,0,1 ), Color.of( r_intensity, 1, 1-r_intensity, 1 ), 10**s ) ];


        // ==== PLANET 1 IMPLEMENTATION ==== //
        let p1_transform = Mat4.identity();
        p1_transform = p1_transform.times(Mat4.rotation(t, Vec.of(0,1,0)));
        p1_transform = p1_transform.times(Mat4.translation([5,0,0]));
        p1_transform = p1_transform.times(Mat4.rotation(t/2, Vec.of(0,1,0)));
        this.shapes.sphere2.draw( graphics_state, p1_transform, this.materials.p1);
        this.planet_1 = p1_transform;


        // ==== PLANET 2 IMPLEMENTATION ==== //
        let p2_transform = Mat4.identity();
        p2_transform = p2_transform.times(Mat4.rotation(t/2, Vec.of(0,1,0)));
        p2_transform = p2_transform.times(Mat4.translation([8,0,0]));
        p2_transform = p2_transform.times(Mat4.rotation(t/2, Vec.of(0,1,0)));
        
        let even = Math.floor(t) % 2;
        if (! even)  // Smooth shading every even second, gouraud shading every odd second
        {  this.shapes.sphere3.draw( graphics_state, p2_transform, this.materials.p2);  }
        else
        {  this.shapes.sphere3.draw( graphics_state, p2_transform, this.materials.p2.override({gouraud:1}));  }
        this.planet_2 = p2_transform;


        // ==== PLANET 3 IMPLEMENTATION ==== //
        let p3_transform = Mat4.identity();
        p3_transform = p3_transform.times(Mat4.rotation(t/3, Vec.of(0,1,0)));
        p3_transform = p3_transform.times(Mat4.translation([11,0,0]));

        p3_transform = p3_transform.times(Mat4.translation([0,-1,0]));
        p3_transform = p3_transform.times(Mat4.rotation(1.5*t, Vec.of(1,0,0)));  // Add wobble effect
        p3_transform = p3_transform.times(Mat4.translation([0,1,0]));

        p3_transform = p3_transform.times(Mat4.rotation(t/2, Vec.of(0,1,0)));
        this.shapes.sphere4.draw( graphics_state, p3_transform, this.materials.p3);
        this.shapes.torus2.draw( graphics_state, p3_transform.times(Mat4.scale([1,1,0.1,1])), this.materials.p3);
        this.planet_3 = p3_transform;


        // ==== PLANET 4 IMPLEMENTATION ==== //
        let p4_transform = Mat4.identity();
        p4_transform = p4_transform.times(Mat4.rotation(t/4, Vec.of(0,1,0)));
        p4_transform = p4_transform.times(Mat4.translation([14,0,0]));
        p4_transform = p4_transform.times(Mat4.rotation(t/2, Vec.of(0,1,0)));
        this.shapes.sphere4.draw( graphics_state, p4_transform, this.materials.p4);
        this.planet_4 = p4_transform;

        let moon_transform = p4_transform;
        moon_transform = moon_transform.times(Mat4.rotation(t/2, Vec.of(0,1,0)));
        moon_transform = moon_transform.times(Mat4.translation([2,0,0]));
        moon_transform = moon_transform.times(Mat4.rotation(t/2, Vec.of(0,1,0)));
        this.shapes.sphere1.draw( graphics_state, moon_transform, this.materials.moon);
        this.moon = moon_transform;

      }
  }






// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );
        

                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }