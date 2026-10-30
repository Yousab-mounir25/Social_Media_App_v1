import mongoose, { DeleteResult, FlattenMaps, ProjectionType, QueryWithHelpers, UpdateQuery, UpdateWithAggregationPipeline } from "mongoose";
import { PopulateOptions } from "mongoose";
import { QueryOptions } from "mongoose";
import { QueryFilter } from "mongoose";
import { AnyKeys, CreateOptions, HydratedDocument, Model } from "mongoose";
import { IPaginate } from "../interface/paginate.interface.js";
import { MongooseUpdateQueryOptions } from "mongoose";
import { UpdateWriteOpResult } from "mongoose";


export abstract class DatabaseRepository<TRawDocType>{
    constructor(protected model:Model<TRawDocType>){}

    //CREATE
    async create({data }:{data:AnyKeys<TRawDocType>}):Promise<HydratedDocument<TRawDocType>>
    async create({data , options}:{data:AnyKeys<TRawDocType>[] , options?:CreateOptions}):Promise<HydratedDocument<TRawDocType>[]>
    async create({data , options}:{data:AnyKeys<TRawDocType> | AnyKeys<TRawDocType>[] , options?:CreateOptions}):Promise<HydratedDocument<TRawDocType> |HydratedDocument<TRawDocType>[] >{
        return await this.model.create(data as any , options)
    }

    //CREATE One
    async createOne({data , options={}}:{data:AnyKeys<TRawDocType> , options?:CreateOptions}):Promise<HydratedDocument<TRawDocType> >{
        const[doc] =  await this.create({data:[data],options:options})
        return doc as HydratedDocument<TRawDocType>
    }


    //FINDERS
         async findOne({  
     filter,
      projection,
      options
    }:{
     filter: QueryFilter<TRawDocType>,
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType> & {lean?:false}  | null | undefined 

    }):Promise<HydratedDocument<TRawDocType> | undefined | null >

     async findOne({
     filter,
      projection,
      options
    }:{
     filter: QueryFilter<TRawDocType>,
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType> & {lean?:true}  | null | undefined 

    }):Promise<HydratedDocument<TRawDocType> | undefined | null | FlattenMaps <TRawDocType>>

    async findOne({
     filter,
      projection,
      options
    }:{
     filter: QueryFilter<TRawDocType>,
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType> &{lean?:boolean} | null | undefined 

    }):Promise<HydratedDocument<TRawDocType> | undefined | null | FlattenMaps <TRawDocType>>{
        const doc =  this.model.findOne(filter , projection)
        if(options?.populate){
            doc.populate(options.populate as PopulateOptions[])
        }
        if(options?.lean){
            doc.lean(options.lean )
        }
        return await doc.exec()
    }
    //lean false ===> hydrated  

 
    //FindById

         async findById({
     id,
      projection,
      options
    }:{
    id: mongoose.Types.ObjectId,
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType> & {lean?:false}  | null | undefined 

    }):Promise<HydratedDocument<TRawDocType> | undefined | null | FlattenMaps <TRawDocType>>

     async findById({
     id,
      projection,
      options
    }:{
     id: mongoose.Types.ObjectId
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType> & {lean?:true}  | null | undefined 

    }):Promise<HydratedDocument<TRawDocType> | undefined | null | FlattenMaps <TRawDocType>>

    async findById({
     id,
      projection,
      options
    }:{
     id: mongoose.Types.ObjectId,
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType> &{lean?:boolean} | null | undefined 

    }):Promise<HydratedDocument<TRawDocType> | undefined | null | FlattenMaps <TRawDocType>>{
        const doc =  this.model.findById(id , projection)
        
        if(options?.populate){
            doc.populate(options.populate as PopulateOptions[])
        }
        if(options?.lean){
            doc.lean(options.lean )
        }
        return await doc.exec()
    }
    //lean false ===> hydrated  



    ///FIND
    async find  ({ 
      filter,
       options, 
       projection 
    } : {
      filter?: QueryFilter<TRawDocType>,
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType> 
    }):Promise<HydratedDocument<TRawDocType>[]>  {
  const doc = this.model.find(filter || {});
  if (options?.select) {
    doc.populate(options.select);
  }
  if (options?.populate) {
    doc.populate(options.populate as PopulateOptions[]);
  }
  if (options?.skip) {
    doc.skip(options.skip);
  }
  if (options?.sort) {
    doc.sort(options.sort);
  }

  if (options?.limit) {
    doc.limit(options.limit);
  }

  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
};


  async countDocuments  ({
   filter, 
  } : {
     filter?: QueryFilter<TRawDocType>,
  }) :Promise<number> {
  return await this.model.countDocuments(filter);
};

  async paginate ({
  filter = {},
  options = {},
  page = 1,
  limit = 5,
} : {
      filter?: QueryFilter<TRawDocType>,
      projection?: ProjectionType<TRawDocType> | null | undefined,
      options?: QueryOptions<TRawDocType>,
      page:number,
      limit:number
}):Promise<IPaginate<HydratedDocument<TRawDocType>>> {
  const skip = (page - 1) * limit;
   const count = await this.countDocuments({ filter});
  const pages = Math.ceil(count / limit);
  const docs = await this.find({
    filter,
    options:{
      ...options,
      skip,
      limit
    }
  });

  return {count ,limit , pages , currentPage:page , docs}
};

// Update

async updateOne(
  {
    filter={},
    update ,
    options
  }:
  {
      filter: QueryFilter<TRawDocType>,
      update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
      options?:  MongooseUpdateQueryOptions<TRawDocType> | null
  }
  
    ): Promise<UpdateWriteOpResult>
    {
  return await this.model.updateOne(filter , update ,options )

}
async updateMany(
  {
    filter={},
    update ,
    options
  }:
  {
      filter: QueryFilter<TRawDocType>,
      update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
      options?:  MongooseUpdateQueryOptions<TRawDocType> | null
  }
  
    ): Promise<UpdateWriteOpResult>
    {
  return await this.model.updateMany(filter , update ,options )

}
async findOneAndUpdate(
  {
    filter={},
    update ,
    options
  }:
  {
      filter?: QueryFilter<TRawDocType>,
      update?: UpdateQuery<TRawDocType>,
      options?: QueryOptions<TRawDocType> | null
  }
  
    ): Promise<HydratedDocument<TRawDocType> | null>
    {
  return await this.model.findOneAndUpdate(filter , update , {
    returnDocument:'after' ,
    ...options
  } )

}
async findByIdAndUpdate(
  {
    id,
    update ,
    options
  }:
  {
      id:mongoose.Types.ObjectId,
      update?: UpdateQuery<TRawDocType>,
      options?: QueryOptions<TRawDocType> | null
  }
  
    ): Promise<HydratedDocument<TRawDocType> | null>
    {
  return await this.model.findByIdAndUpdate(id , update , {
    returnDocument:'after' ,
    ...options
  } )

}


//DELETE
async deleteOne(
  {
    filter={},
  }:
  {
      filter: QueryFilter<TRawDocType>,

  }
  
    ): Promise<DeleteResult>
    {
  return await this.model.deleteOne(filter  )

}
async deleteMany(
  {
    filter={},
   
  }:
  {
      filter: QueryFilter<TRawDocType>,
  }
  
    ): Promise<DeleteResult>
    {
  return await this.model.deleteMany(filter )

}
async findOneAndDelete(
  {
    filter={},
  }:
  {
      filter?: QueryFilter<TRawDocType>,
 
  }
  
    ): Promise<HydratedDocument<TRawDocType> | null>
    {
  return await this.model.findOneAndDelete(filter )

}
async findByIdAndDelete(
  {
    id,
   
  }:
  {
      id:mongoose.Types.ObjectId,
  
  }
  
    ): Promise<HydratedDocument<TRawDocType> | null>
    {
  return await this.model.findByIdAndDelete(id)

}

}
