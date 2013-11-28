function onDocumentMouseDown(event) {
    if (event.which === 3) {
        isRightClick = true;
    }
    isUserInteracting = true;
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    var vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    projector.unprojectVector(vector, camera);
    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(objects, true);
    if (intersects[0] !== undefined) {
        interactiveObject = intersects[0].object.parent;
        onMouseDownObjectXRotation = interactiveObject.rotation.x;
        onMouseDownObjectYRotation = interactiveObject.rotation.y;
        onMouseDownObjectZRotation = interactiveObject.rotation.z;
        if (interactiveObject.name === "marker.obj") {
            getMenu();
        }
    }
    var intersects2 = raycaster.intersectObjects(interactiveTexts, true);
    if (intersects2.length === 0)
        intersects2 = raycaster.intersectObjects(menuPoints, true);
    if (intersects2[0] !== undefined) {
        
        var information = intersects2[0].object.name.split(" ");
        var hotspotArray = getContent("hotspotInfo",information[0]);
        var hotspotPosition = intersects2[0].object.position;
        var hotspotInfo = hotspotArray.pop()[information[1]];
        
        portal(hotspotInfo, hotspotPosition);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    if (isUserInteracting && interactiveObject === undefined) {
        console.log("Longitude: " + lon.toString());
        console.log("Latitude: " + lat.toString());
        lon = mod(((onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon), 360);
        var rawLat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        lat = Math.max(rawLat, latLimit);
    }
    if (interactiveObject !== undefined && !isRightClick) {
        interactiveObject.rotation.y = (event.clientX - onPointerDownPointerX) * 0.01 + onMouseDownObjectYRotation;
        interactiveObject.rotation.z = (onPointerDownPointerY - event.clientY) * 0.01 + onMouseDownObjectZRotation;
    }
    if (interactiveObject !== undefined && isRightClick) {
        interactiveObject.rotation.x = (onPointerDownPointerY - event.clientY) * 0.01 + onMouseDownObjectXRotation;
    }
    sprite.position.set(event.clientX, event.clientY - 20, 0);
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentMouseUp(event) {
    event.preventDefault();
    isRightClick = false;
    isUserInteracting = false;
    if (interactiveObject !== undefined) {
        if (interactiveObject.rotation.y === onMouseDownObjectYRotation &&
                interactiveObject.rotation.z === onMouseDownObjectZRotation &&
                interactiveObject.rotation.x === onMouseDownObjectXRotation) {
            popUp(interactiveObject.name);
        }
    }
    interactiveObject = undefined;
}

function onDocumentMouseWheel(event) {
    event.preventDefault();
//    var number = element.style.width.split("px")[0];
//    console.log(event);
//    console.log(event.wheelDelta * 0.05);
//    number += (event.wheelDelta * 0.05);
//    console.log(number);
//    element.style.width = (number-2) + "px";
//    console.log(element.style.width);
    if (!amILoading) {
        var sub = fov - Math.min((event.wheelDeltaY * 0.05), 2);
        if (maxZoom <= sub && sub <= minZoom) {
            // WebKit
            if (event.wheelDeltaY) {
                fov -= Math.min((event.wheelDeltaY * 0.05), 2);
                // Opera / Explorer 9
            } else if (event.wheelDelta) {
                fov -= Math.min((event.wheelDelta * 0.05), 2);
                // Firefox
            } else if (event.detail) {
                fov += Math.min((event.detail * 1.0), 2);
            }
            camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
            render();
        }
        if (sub < maxZoom) {
            console.log("Mi hai chiamato!");
            getNewPanorama();
        }
    }
}

function onDocumentDoubleclick(event) {
    event.preventDefault();
    var predefinedZoom = Math.floor(((minZoom - maxZoom) / 3) * 1000) / 1000;
    var newFov = fov - predefinedZoom;
    if (maxZoom < newFov && newFov < minZoom) {
        fov -= predefinedZoom;
        camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
        render();
    }
    else {
        var found = getNewPanorama();
        if (!found) {
            fov = 70;
            camera.projectionMatrix.makePerspective(fov, window.innerWidth / window.innerHeight, 1, 1100);
            render();
        }
    }
}

function onDocumentRightClick(event) {
    event.preventDefault();
}