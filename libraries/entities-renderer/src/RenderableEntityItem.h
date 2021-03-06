//
//  RenderableEntityItem.h
//  interface/src
//
//  Created by Brad Hefta-Gaub on 12/6/13.
//  Copyright 2013 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

#ifndef hifi_RenderableEntityItem_h
#define hifi_RenderableEntityItem_h

#include <render/Scene.h>
#include <EntityItem.h>
#include "AbstractViewStateInterface.h"
#include "EntitiesRendererLogging.h"


// These or the icon "name" used by the render item status value, they correspond to the atlas texture used by the DrawItemStatus
// job in the current rendering pipeline defined as of now  (11/2015) in render-utils/RenderDeferredTask.cpp.
enum class RenderItemStatusIcon {
    ACTIVE_IN_BULLET = 0,
    PACKET_SENT = 1,
    PACKET_RECEIVED = 2,
    SIMULATION_OWNER = 3,
    HAS_ACTIONS = 4,
    OTHER_SIMULATION_OWNER = 5,
    CLIENT_ONLY = 6,
    NONE = 255
};

void makeEntityItemStatusGetters(EntityItemPointer entity, render::Item::Status::Getters& statusGetters);


class RenderableEntityItemProxy {
public:
    RenderableEntityItemProxy(EntityItemPointer entity, render::ItemID metaID) : _entity(entity), _metaID(metaID) { }
    typedef render::Payload<RenderableEntityItemProxy> Payload;
    typedef Payload::DataPointer Pointer;

    EntityItemPointer _entity;
    render::ItemID _metaID;
};

namespace render {
   template <> const ItemKey payloadGetKey(const RenderableEntityItemProxy::Pointer& payload);
   template <> const Item::Bound payloadGetBound(const RenderableEntityItemProxy::Pointer& payload);
   template <> void payloadRender(const RenderableEntityItemProxy::Pointer& payload, RenderArgs* args);
   template <> uint32_t metaFetchMetaSubItems(const RenderableEntityItemProxy::Pointer& payload, ItemIDs& subItems);
}

// Mixin class for implementing basic single item rendering
class SimpleRenderableEntityItem {
public:
    bool addToScene(EntityItemPointer self, const render::ScenePointer& scene, render::Transaction& transaction) {
        _myItem = scene->allocateID();

        auto renderData = std::make_shared<RenderableEntityItemProxy>(self, _myItem);
        auto renderPayload = std::make_shared<RenderableEntityItemProxy::Payload>(renderData);

        render::Item::Status::Getters statusGetters;
        makeEntityItemStatusGetters(self, statusGetters);
        renderPayload->addStatusGetters(statusGetters);

        transaction.resetItem(_myItem, renderPayload);

        return true;
    }

    void removeFromScene(EntityItemPointer self, const render::ScenePointer& scene, render::Transaction& transaction) {
        transaction.removeItem(_myItem);
        render::Item::clearID(_myItem);
    }

    void notifyChanged() {
        if (!render::Item::isValidID(_myItem)) {
            return;
        }

        render::Transaction transaction;
        render::ScenePointer scene = AbstractViewStateInterface::instance()->getMain3DScene();

        if (scene) {
            transaction.updateItem<RenderableEntityItemProxy>(_myItem, [](RenderableEntityItemProxy& data) {
            });

            scene->enqueueTransaction(transaction);
        } else {
            qCWarning(entitiesrenderer) << "SimpleRenderableEntityItem::notifyChanged(), Unexpected null scene, possibly during application shutdown";
        }
    }

private:
    render::ItemID _myItem { render::Item::INVALID_ITEM_ID };
};


#define SIMPLE_RENDERABLE() \
public: \
    virtual bool addToScene(EntityItemPointer self, const render::ScenePointer& scene, render::Transaction& transaction) override { return _renderHelper.addToScene(self, scene, transaction); } \
    virtual void removeFromScene(EntityItemPointer self, const render::ScenePointer& scene, render::Transaction& transaction) override { _renderHelper.removeFromScene(self, scene, transaction); } \
    virtual void locationChanged(bool tellPhysics = true) override { EntityItem::locationChanged(tellPhysics); _renderHelper.notifyChanged(); } \
    virtual void dimensionsChanged() override { EntityItem::dimensionsChanged(); _renderHelper.notifyChanged(); } \
    void checkFading() { \
        bool transparent = isTransparent(); \
        if (transparent != _prevIsTransparent) { \
            _renderHelper.notifyChanged(); \
            _isFading = false; \
            _prevIsTransparent = transparent; \
        } \
    } \
private: \
    SimpleRenderableEntityItem _renderHelper; \
    bool _prevIsTransparent { isTransparent() };


#endif // hifi_RenderableEntityItem_h
