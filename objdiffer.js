/*
 * ----------------------------- OBJDIFFER -------------------------------------
 * Makes possible to save only changed parts of an object value by creating
 * and apllying diff patches.
 *
 * Copyright (c) 2010 Andris Reinman, andris.reinman@gmail.com
 * Project homepage: www.tahvel.info/objdiffer
 *
 * Licensed under MIT-style license:
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


/**
 * new ObjDiffer(original, patch)
 * - original (var): original value to be used as the base
 * - patch (var): additions to the original value (previously saved diff etc.)
 * 
 * Constructor creates a diff object from the original value and the patch.
 * You can use the <value> parameter of the resulting object as any variable
 * but when needed the method <getDiff()> creates a diff from it.
 * 
 * So you can use a common base object and save/load only additions to this
 * object for every single user.
 * 
 * Example
 * 
 * - Initial visit:
 * 
 *     var settings = new ObjDiffer(general_settings);
 *     settings.value.on_page_item_count = 5;
 *     var diff = settings.getDiff(); // {"on_page_item_count":5}
 *     save_to_server(diff);
 * 
 * - Next visits:
 * 
 *     var patch = load_from_server();
 *     var settings = new ObjDiffer(general_settings, patch);
 *     alert(settings.value.on_page_item_count); // 5
 * 
 **/
ObjDiffer = function(original, patch){
    this.original = original || {};
    this.patch = patch;
    this.clone(original);
    if(typeof patch !== "undefined")
        this.applyPatch();
}

/**
 * ObjDiffer#clone() -> undefined
 * 
 * Clones a value from original to local value by copying every
 * property of the original object
 * 
 **/
ObjDiffer.prototype.clone = function(){
    var walk = function(val, org){
        for(var i in org){
            if(org.hasOwnProperty(i)){
                if(typeof org[i]!="object" || org[i] === null){
                    val[i] = org[i];
                }else{
                    val[i] = {};
                    walk(val[i], org[i]);
                }
            }
        }
    }
    if(typeof this.original != "object" || this.original === null){
        this.value = this.original;
    }else{
        this.value = {};
        walk(this.value, this.original);
    }
}

/**
 * ObjDiffer#apply() -> undefined
 * 
 * Apply the patch to the original value
 **/
ObjDiffer.prototype.applyPatch = function(){
    var value = this.value,
        walk = function(obj, org){
            for(var i in obj){
                if(obj.hasOwnProperty(i)){
                    if(!org[i]){
                        org[i] = obj[i];
                    }else
                        if(typeof org[i]!="object" || org[i] === null){
                        org[i] = obj[i];
                    }else
                    {
                        walk(obj[i],org[i]);
                    }
                    
                }
            }
        }
    if(typeof value!="object" || value === null){
        this.value = this.patch;
    }else
        walk(this.patch, value);
}

/**
 * ObjDiffer#getDiff() -> var
 * 
 * Compare the current value to the original one and create a value
 * that holds all the differences
 **/
ObjDiffer.prototype.getDiff = function(){
    
    var result = {},
        walk = function(obj, res, org){
            var j=0;
            for(var i in obj){
                j=0;
                if(typeof org[i] == "undefined" || (obj[i] != org[i] && (typeof obj[i]!="object" || obj[i]===null))){
                    res[i] = obj[i];
                }else if(typeof obj[i]=="object" && obj[i]!==null){
                    res[i] = {};
                    walk(obj[i], res[i], org[i]);
                }
                if(typeof res[i]=="object" && res[i]!==null){
                    // checks if the object has any properties
                    for (var i in res[i]){
                        j++;
                        break;
                    }
                }
                // removes non-used property value
                if(typeof res[i]=="undefined" || (typeof res[i]=="object" && res[i]!==null && !j))
                    delete res[i]; 
            }
        }
    if(typeof this.value!="object" || this.value === null){
        if(this.value!=this.original)
            return this.value;
        else
            return undefined;
    }else{
        walk(this.value, result, this.original);
        return result;
    }
}