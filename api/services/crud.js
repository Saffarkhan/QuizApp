//find single quiz detials
export function find(model, filter, projection = {}) {
    return model.findOne(filter, projection)

}

//find/show list of all active quizes 
export function getList(model, filter, projection = {}, population_array) {
    return model.find(filter, projection).populate(population_array)
}

//ceate new quiz and save in the databsae
export function create(model, filter) {
    let new_document = new model(filter)
    return new_document.save()

}

export function updateOne(model, filter, data_to_update) {
    return model.updateOne(filter, { $set: data_to_update })
}

//delete a specific quiz 
export function deleteObject(model, _id) {
    return model.updateOne({ _id }, { $set: { is_deleted: true } })
}

export function aggregate(model, aggregation_pipeline) {
    return model.aggregate(aggregation_pipeline)
}

export default { create, getList, find, deleteObject, aggregate, updateOne }