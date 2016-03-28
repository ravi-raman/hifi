 var TRANSFORMER_SCRIPT = Script.resolvePath('transformer.js?' + Math.random());
 // var SHRINK_AMOUNT = 1 / 2;
 TransformerDoll = function(modelURL, spawnPosition, spawnRotation, dimensions) {
     print('SCRIPT REF AT TRANSFORMER CREATE::' + TRANSFORMER_SCRIPT);
     var transformerProps = {
         name: 'hifi-home-dressing-room-little-transformer',
         type: 'Model',
         shapeType: 'box',
         position: spawnPosition,
         rotation: Quat.fromPitchYawRollDegrees(spawnRotation.x, spawnRotation.y, spawnRotation.z),
         modelURL: modelURL,
         dynamic: true,
         gravity: {
             x: 0,
             y: -5,
             z: 0
         },
         visible: false,
         damping: 0.8,
         userData: JSON.stringify({
             'grabbableKey': {
                 'grabbable': true
             },
             'hifiHomeTransformerKey': {
                 'basePosition': spawnPosition,
                 'baseRotation': Quat.fromPitchYawRollDegrees(spawnRotation.x, spawnRotation.y, spawnRotation.z),
             },
             'hifiHomeKey': {
                 'reset': true
             }
         }),
         dimensions: dimensions,
         script: TRANSFORMER_SCRIPT
     }
     var transformer = Entities.addEntity(transformerProps);
     // Script.setTimeout(function() {
     //     var actualProps = Entities.getEntityProperties(transformer);
     //     var quarterSize = Vec3.multiply(SHRINK_AMOUNT, actualProps.naturalDimensions);
     //     Entities.editEntity(transformer, {
     //         dimensions: quarterSize,
     //         visible:true,
     //         // velocity: {
     //         //     x: 0,
     //         //     y: -0.1,
     //         //     z: 0
     //         // }
     //     });
     // }, 1000)

     print('CREATED TRANSFORMER' + transformer);
     // print('at location: ' + JSON.stringify(transformerProps.position))

     return this;
 }